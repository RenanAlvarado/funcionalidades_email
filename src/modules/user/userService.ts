import bcrypt from "bcrypt";
import { Repository } from "typeorm";
import database from "../../config/database";
import { RegisterDto } from "../auth/dto/register.dto";
import { UpdateUserDto } from "./dto/updateUser.dto";
import { UserResponseDto } from "./dto/userResponse.dto";
import { User } from "./user.entity";
import AppError from "../../errors/AppError";

class UserService {
  // Dependência do repositório
  private get userRepository(): Repository<User> {
    return database.getRepository(User);
  }

  // Converter entidade para DTO de resposta
  toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // Criar usuário
  async store(registerDto: RegisterDto): Promise<UserResponseDto> {
    const { name, email, password } = registerDto;

    const existingUser = await this.userRepository.findOneBy({ email });

    if (existingUser) {
      throw new AppError("Este e-mail já está cadastrado.", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = this.userRepository.create({
      name,
      email,
      passwordHash,
      emailVerifiedAt: null,
    });

    const savedUser = await this.userRepository.save(user);

    return this.toResponseDto(savedUser);
  }

  // Listar usuários
  async index(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find();

    return users.map((user) => this.toResponseDto(user));
  }

  // Buscar usuário por ID
  async show(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    return this.toResponseDto(user);
  }

  // Buscar usuário por e-mail para autenticação
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ email });

    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    return user;
  }

  // Atualizar usuário
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    const { name, email, password } = updateUserDto;

    if (name !== undefined) {
      user.name = name;
    }

    if (email !== undefined) {
      user.email = email;
    }

    if (password !== undefined) {
      user.passwordHash = await bcrypt.hash(password, 12);
    }

    const updatedUser = await this.userRepository.save(user);

    return this.toResponseDto(updatedUser);
  }

  // Marcar e-mail como verificado
  async verifyEmail(id: number): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    if (user.emailVerifiedAt !== null) {
      throw new AppError("Este e-mail já foi confirmado.", 400);
    }

    user.emailVerifiedAt = new Date();

    await this.userRepository.save(user);
  }

  // Excluir usuário
  async delete(id: number): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    await this.userRepository.remove(user);
  }
}

export default new UserService();
