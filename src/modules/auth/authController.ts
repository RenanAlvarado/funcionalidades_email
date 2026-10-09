import { Request, Response } from "express";
import AuthService from "./authService";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { VerifyEmailDto } from "./dto/verifyEmail.dto";
import { ResendVerificationDto } from "./dto/resendVerification.dto";
import { ResetPasswordDto } from "./dto/resetPassword.dto";
import { ForgotPasswordDto } from "./dto/forgotPassword.dto";

class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const result = await AuthService.register(req.body as RegisterDto);

    res.status(201).json(result);
  }

  async login(req: Request, res: Response): Promise<void> {
    const result = await AuthService.login(req.body as LoginDto);

    res.status(200).json(result);
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    const result = await AuthService.verifyEmail(req.body as VerifyEmailDto);

    res.status(200).json(result);
  }

  async resendVerification(req: Request, res: Response): Promise<void> {
    const result = await AuthService.resendVerification(
      req.body as ResendVerificationDto,
    );

    res.status(200).json(result);
  }

  async forgotPassword(req: Request, res: Response): Promise<Response> {
    const result = await AuthService.forgotPassword(
      req.body as ForgotPasswordDto,
    );

    return res.status(200).json(result);
  }

  async resetPassword(req: Request, res: Response): Promise<Response> {
    const result = await AuthService.resetPassword(
      req.body as ResetPasswordDto,
    );

    return res.status(200).json(result);
  }
}

export default new AuthController();
