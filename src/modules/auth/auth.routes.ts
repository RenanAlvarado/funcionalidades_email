import { Router } from "express";

import { validateBody } from "../../middlewares/validateBody";
import AuthController from "./authController";
import { registerDto } from "./dto/register.dto";
import { loginDto } from "./dto/login.dto";
import { verifyEmailSchema } from "./dto/verifyEmail.dto";
import { resendVerificationSchema } from "./dto/resendVerification.dto";
import { forgotPasswordSchema } from "./dto/forgotPassword.dto";
import { resetPasswordSchema } from "./dto/resetPassword.dto";

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

authRoutes.post(
  "/resend-verification",
  validateBody(resendVerificationSchema),
  AuthController.resendVerification.bind(AuthController),
);

authRoutes.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  AuthController.forgotPassword.bind(AuthController),
);

authRoutes.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  AuthController.resetPassword.bind(AuthController),
);

export default authRoutes;
