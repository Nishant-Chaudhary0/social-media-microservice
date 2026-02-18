import express from 'express';
import rateLimit from 'express-rate-limit';
import Redis from 'ioredis';
import logger from './utils/logger.js';
import RedisStore from 'rate-limit-redis';
import proxy from 'express-http-proxy'
import dotenv from 'dotenv'
import errorHandler from './middleware/errorHandler.js'
import validateToken from './middleware/authMiddleware.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json())
// Initialize Redis client
const redisClient = new Redis();

const generalRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Sensitive endpoint rate limit reached for IP: ${req.ip}`);
        res.status(429).json({ success: false, message: "Too many requests" });
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args), // Use the initialized Redis client
    }),
});

app.use(generalRateLimit);

app.use((req, res, next) => {
    logger.info(`received ${req.method} request ${req.url}`);
    logger.info(`request body ${JSON.stringify(req.body)}`);
    next();
});

const proxyOptions = {
    proxyReqPathResolver: (req) => {
        return req.originalUrl.replace(/^\/v1/, "/api");
    },
    proxyErrorHandler: (err, res, next) => {
        logger.error(`Proxy error: ${err.message}`);
        res.status(500).json({
            message: 'Internal server error',
            error: err.message,
        });
    },
};

app.use(
  "/v1/auth",
  proxy(process.env.AUTH_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(`Response received from auth service: ${proxyRes.statusCode}`);
      return proxyResData;
    },
  })
);

app.use("/v1/posts",validateToken,proxy(process.env.POST_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator:(proxyReqOpts, srcReq) => {
        proxyReqOpts.headers["content-type"] = "application/json";
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId;
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info("response recieved from post service", proxyRes.statusCode);
        return proxyResData;
    },
}))

app.use(errorHandler)
app.listen(port, () => {
    console.log("API Gateway server is running on port:", port);
    logger.info(`API Gateway server is running on port: ${port}`);
    logger.info(`Auth service is running on port : ${process.env.AUTH_SERVICE_URL}`);
    logger.info(`Post service is running on port : ${process.env.POST_SERVICE_URL}`)
    logger.info(`Redis url"${process.env.REDIS_URL}`); 
});