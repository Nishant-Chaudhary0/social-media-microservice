import express from "express";
import { createPost } from "../controllers/postController";
import { authenticateRequest } from "../middleware/authMiddleware";

const router = express.Router();

router.use(authenticateRequest);

router.post("/create-post", createPost);

export default router;