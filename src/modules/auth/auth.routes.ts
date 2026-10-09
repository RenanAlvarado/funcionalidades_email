import { Router } from "express";

import { validateBody } from "../../middlewares/validateBody";
import AuthController from "./authController";
import { registerDto } from "./dto/register.dto";
import { loginDto } from "./dto/login.dto";
import { verifyEmailSchema } from "./dto/verifyEmail.dto";

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

authRoutes.post(
  "/verify-email",
  validateBody(verifyEmailSchema),
  AuthController.verifyEmail.bind(AuthController),
);

export default authRoutes;
