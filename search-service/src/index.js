import express from "express";
import logger from './utils/logger.js'
import dotenv from 'dotenv';
import errorHandler from "./middleware/errorHandler.js";
import router from "./routes/postRoutes.js";
import cors from 'cors';
import helmet from 'helmet';
import redis from 'ioredis';
import mongoose from "mongoose";
import { connectRabbitmq } from "./utils/rabbitMQ.js";
import router from "./routes/searchRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3004;

mongoose.connect(process.env.MONGODB_URI).then(() => logger.info("Connected to mongoDB")).catch((e) => logger.error("failed to connect with mongoDB"));

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use((req, res, next) => {
    logger.info(`recieved ${req.method} request to ${req.url}`);
    logger.info(`request.body ${req.body}`);
})
app.use("/api/search", router);
app.use(errorHandler);