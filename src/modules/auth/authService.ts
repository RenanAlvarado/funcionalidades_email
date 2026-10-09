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

    console.log(verificationToken);

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
}

export default new AuthService();
