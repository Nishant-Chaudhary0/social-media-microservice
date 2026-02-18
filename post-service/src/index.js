import express from "express";
import logger from './utils/logger.js'
import dotenv from 'dotenv';
import errorHandler from "./middleware/errorHandler.js";
import router from "./routes/postRoutes.js";
import cors from 'cors';
import helmet from 'helmet';
import redis from 'ioredis';
import mongoose from "mongoose";
import rateLimit from 'express-rate-limit';
import {RedisStore} from 'rate-limit-redis';
import { RateLimiterRedis } from "rate-limiter-flexible";

dotenv.config();

const redisClient = new redis(process.env.REDIS_URL);

redisClient.on("error", (error) => {
    logger.warn("error connecting to redis", error.message);
    console.log("error connecting to redis", error);
})

const app = express();
const port = process.env.PORT || 3002;

mongoose.connect(process.env.MONGODB_URI).then(() => logger.info("connected to mongodb")).catch((e) => logger.warn("error connecting to mongodb",e))
app.use(express.json());
app.use(cors());
app.use(helmet())

const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "middleware",
    points: 10,
    duration: 1,
});

app.use((req, res, next) => {
    rateLimiter.consume(req.ip).then(() => next()).catch(() => {
        logger.warn(`rate limit exeeded for IP : ${req.ip}`);
        res.status(429).json({
            success: false,
            message: "Too many requests"
        })
    })
})

const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`limit reached for IP ${req.ip}`),
        res.status(429).json({
            success:  false,
            message: "Too many requests"
        })
    },
    store: new RedisStore({
        sendCommand : (...args) => redisClient.call(...args)
    })
})

app.use((req, res, next) => {
    if(req.path === "/api/post/create-post"){
        return next();
    }
    generalRateLimiter(req, res, next)
});

const sensitiveEndpointRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn("limit reached for IP", req.ip);
        res.status(429).json({
            success: false,
            message: "Too many requests"
        })
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
    })
})

app.use("/api/post/create-post", sensitiveEndpointRateLimiter);

app.use("/api/posts", (req, res, next) => {
    req.redisClient = redisClient;
    next();
}, router);
app.use(errorHandler);



app.listen(process.env.PORT, () => {
    logger.info("Post service is running on port : ", port);
})

process.on("unhandledRejection", (reason, promise) => {
    logger.error("unhandled rejection at,", promise, "   reason :", reason);
});