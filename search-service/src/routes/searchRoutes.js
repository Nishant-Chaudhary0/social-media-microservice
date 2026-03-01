import express from "express";
import { authenticateRequest } from "../middleware/authMiddleware";
import { searchController } from "../controllers/searchController";

const router = express.Router;

router.use(authenticateRequest);

router.get("/posts", searchController);

export default router;