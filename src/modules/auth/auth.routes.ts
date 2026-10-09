import { Router } from "express";

import { validateBody } from "../../middlewares/validateBody";
import AuthController from "./authController";
import { registerDto } from "./dto/register.dto";
import { loginDto } from "./dto/login.dto";

const authRoutes = Router();

authRoutes.post(
  "/register",
  validateBody(registerDto),
  AuthController.register.bind(AuthController),
);

authRoutes.post(
  "/login",
  validateBody(loginDto),
  AuthController.login.bind(AuthController),
);

export default authRoutes;
