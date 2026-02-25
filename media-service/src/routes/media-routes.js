import logger from "../utils/logger.js";
import multer from 'multer';
import { authenticateRequest } from "../middlewares/authMiddleware.js";
import express from "express";
import { uploadMedia } from "../controllers/media-controller.js";

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
}).single('file')

router.post(
  "/upload",
  authenticateRequest,
  (req, res, next) => {
    logger.info("Request headers:", req.headers);
    logger.info("Request body:", req.body);

    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        logger.error("Multer error while uploading", err);
        return res.status(400).json({
          message: "File upload error",
          success: false,
          error: err.message,
        });
      } else if (err) {
        logger.error("Unknown error while uploading", err);
        return res.status(500).json({
          message: "Unknown error",
          success: false,
          error: err.message,
        });
      }

      if (!req.file) {
        logger.warn("No file found in the request");
        return res.status(400).json({
          message: "No file found",
          success: false,
        });
      }

      logger.info(`File received: ${req.file.originalname}`);
      next();
    });
  },
  uploadMedia
);

export default router;