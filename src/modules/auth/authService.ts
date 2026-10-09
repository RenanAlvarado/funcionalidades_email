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

class AuthService {
  private get userRepository(): Repository<User> {
    return database.getRepository(User);
  }

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
  ): Promise<{ user: UserResponseDto; token: string }> {
    const user = await UserService.store(registerDto);
    const token = this.generateToken(user.id);

    return { user, token };
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

    const token = this.generateToken(user!.id);

    const userResponse = UserService.toResponseDto(user!);

    return {
      user: userResponse,
      token,
    };
  }
}

export default new AuthService();
