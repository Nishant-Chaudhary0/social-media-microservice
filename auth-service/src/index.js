import express from "express";
import mongoose from "mongoose";
import logger from "./utils/logger.js";
import helmet from "helmet";
import dotenv from "dotenv";
import cors from "cors";
import redis from "ioredis";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import routes from "./routes/authService.js";
import errorHandler from "./middlewares/errorHandler.js";

dotenv.config();

const redisClient = new redis(process.env.REDIS_URL);

// Add error handling for Redis connection
redisClient.on("error", (err) => {
    logger.error(`Redis connection error: ${err.message}`);
    console.error("Redis connection error:", err);
});

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => logger.info("mongodb connected"))
    .catch((e) => logger.info("error connecting mongodb", e));

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    logger.info(`received ${req.method} request ${req.url}`);
    logger.info(`request body ${JSON.stringify(req.body)}`);
    next();
});

// General rate limiter (applied globally, excluding sensitive routes)
const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
});

// Apply the general rate limiter globally, but exclude sensitive routes
app.use((req, res, next) => {
    if (req.path === "/api/auth/register") {
        return next(); // Skip the general rate limiter for sensitive routes
    }
    generalRateLimiter(req, res, next);
});

// Sensitive endpoints rate limiter (applied only to specific routes)
const sensitiveEndpointsRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Sensitive endpoint request exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: "Too many requests",
        });
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
});

// Apply the sensitive rate limiter only to the /api/auth/register route
app.use("/api/auth/register", sensitiveEndpointsRateLimiter);

// Mount routes
app.use("/api/auth", routes);

// Error handling middleware
app.use(errorHandler);

app.listen(process.env.PORT, () => {
    console.log("auth service server is running on port:", process.env.PORT);
});

process.on("unhandledRejection", (reason, promise) => {
    logger.error("unhandled rejection at,", promise, "   reason :", reason);
});