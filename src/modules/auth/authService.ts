import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Repository } from "typeorm";
import database from "../../config/database";
import jwtSecret from "../../config/jwt";
import AppError from "../../errors/AppError";
import UserService from "../user/userService";
import { RegisterDto } from "./dto/register.dto";
import { UserResponseDto } from "../user/dto/userResponse.dto";
import { User } from "../user/user.entity";
import { LoginDto } from "./dto/login.dto";
import emailVerificationService from "../emailVerification/emailVerificationService";
import { VerifyEmailDto } from "./dto/verifyEmail.dto";
import { ResendVerificationDto } from "./dto/resendVerification.dto";
import emailService from "../email/emailService";
import { ForgotPasswordDto } from "./dto/forgotPassword.dto";
import passwordResetService from "../passwordReset/passwordResetService";
import { ResetPasswordDto } from "./dto/resetPassword.dto";

class AuthService {
  private generateToken(userId: number): string {
    return jwt.sign({}, jwtSecret!, {
      subject: String(userId),
      expiresIn: "1d",
      algorithm: "HS256",
    });
  }

  // Cadastro
  async register(
    registerDto: RegisterDto,
  ): Promise<{ user: UserResponseDto; message: string }> {
    const user = await UserService.store(registerDto);

    // Criar tabela adicional
    const verificationToken = await emailVerificationService.createToken(
      user.id,
    );

    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      throw new Error("Configure FRONTEND_URL no ambiente.");
    }

    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;

    await emailService.sendVerificationEmail(user.email, verificationLink);

    return {
      user,
      message:
        "Cadastro realizado. Confirme seu e-mail para acessar sua conta.",
    };
  }

  // Login
  async login(
    loginDto: LoginDto,
  ): Promise<{ user: UserResponseDto; token: string }> {
    const { email, password } = loginDto;

    const user = await UserService.findByEmail(email);

    const passwordMatches = await bcrypt.compare(password, user!.passwordHash);

    if (!passwordMatches) {
      throw new AppError("E-mail ou senha inválidos.", 401);
    }

    // Verificar se o e-mail foi confirmado
    if (user!.emailVerifiedAt === null) {
      throw new AppError("Confirme seu e-mail antes de entrar.", 403);
    }

    // Gerar JWT somente após validar as credenciais e a confirmação
    const token = this.generateToken(user!.id);

    const userResponse = UserService.toResponseDto(user!);

    return {
      user: userResponse,
      token,
    };
  }

  // Verificar email baseado no token
  async verifyEmail(
    verifyEmailDto: VerifyEmailDto,
  ): Promise<{ message: string }> {
    await emailVerificationService.verifyToken(verifyEmailDto.token);

    return {
      message: "E-mail confirmado com sucesso.",
    };
  }

  async resendVerification(
    resendVerificationDto: ResendVerificationDto,
  ): Promise<{ message: string }> {
    const { email } = resendVerificationDto;

    const user = await UserService.findByEmail(email);

    if (user!.emailVerifiedAt !== null) {
      throw new AppError("Este e-mail já foi confirmado.", 400);
    }

    const RESEND_COOLDOWN_SECONDS = 60;

    const latestTokenDate =
      await emailVerificationService.getLatestTokenCreationDate(user!.id);

    if (latestTokenDate) {
      const elapsedSeconds = (Date.now() - latestTokenDate.getTime()) / 1000;

      if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
        const remainingSeconds = Math.ceil(
          RESEND_COOLDOWN_SECONDS - elapsedSeconds,
        );

        throw new AppError(
          `Aguarde ${remainingSeconds} segundos antes de solicitar outro e-mail.`,
          429,
        );
      }
    }

    await emailVerificationService.invalidatePreviousTokens(user!.id);

    const verificationToken = await emailVerificationService.createToken(
      user!.id,
    );

    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      throw new Error("Configure FRONTEND_URL no ambiente.");
    }

    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;

    await emailService.sendVerificationEmail(user!.email, verificationLink);

    return {
      message: "Um novo link de confirmação foi enviado para seu e-mail.",
    };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const genericMessage =
      "Se o endereço estiver cadastrado, você receberá um e-mail com as instruções para redefinir sua senha.";

    const PASSWORD_RESET_COOLDOWN_SECONDS = 60;

    const user = await UserService.findByEmailOrNull(email);

    if (!user) {
      return { message: genericMessage };
    }

    if (user.emailVerifiedAt === null) {
      return { message: genericMessage };
    }

    const latestTokenDate =
      await passwordResetService.getLatestTokenCreationDate(user.id);

    if (latestTokenDate) {
      const elapsedSeconds = (Date.now() - latestTokenDate.getTime()) / 1000;

      if (elapsedSeconds < PASSWORD_RESET_COOLDOWN_SECONDS) {
        const remainingSeconds = Math.ceil(
          PASSWORD_RESET_COOLDOWN_SECONDS - elapsedSeconds,
        );

        throw new AppError(
          `Aguarde ${remainingSeconds} segundos antes de solicitar outro e-mail.`,
          429,
        );
      }
    }

    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      throw new Error("Configure FRONTEND_URL no ambiente.");
    }

    await passwordResetService.invalidatePreviousTokens(user.id);

    const resetToken = await passwordResetService.createToken(user.id);

    const resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

    await emailService.sendPasswordResetEmail(user.email, resetLink);

    return { message: genericMessage };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    await passwordResetService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );

    return {
      message:
        "Senha redefinida com sucesso. Você já pode entrar com a nova senha.",
    };
  }
}

export default new AuthService();
