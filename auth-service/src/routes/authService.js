import express from "express";
import { registerUser, loginUser, refreshTokenUser, logoutUser } from "../controllers/userController.js";

const routes = express.Router();

routes.post("/register", registerUser);
routes.post("/login", loginUser);
routes.post("/refresh-token", refreshTokenUser);
routes.post("/logout", logoutUser)

export default routes;