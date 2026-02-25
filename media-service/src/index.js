import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import mongoose from "mongoose";
import logger from "./utils/logger.js";
import cors from "cors";
import errorHandler from "./middlewares/errorHandler.js";
import mediaRoutes from "./routes/media-routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connected to MongoDB"))
  .catch((err) => logger.error("MongoDB connection error", err));

// Middlewares
app.use(cors());
app.use(helmet());

// Logging
app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  next();
});

// Routes
app.use("/api/media", mediaRoutes);

// Error handler
app.use(errorHandler);

// Start server
app.listen(port, () => {
  logger.info(`Media service running on port ${port}`);
});