import { createHash, randomBytes } from "node:crypto";
import { Repository } from "typeorm";
import database from "../../config/database";
import { EmailVerificationToken } from "./emailVerificationToken.entity";
import AppError from "../../errors/AppError";
import userService from "../user/userService";

const TOKEN_EXPIRATION_MINUTES = Number(
  process.env.EMAIL_VERIFICATION_TOKEN_EXPIRATION_MINUTES ?? 30,
);

class EmailVerificationService {
  private get tokenRepository(): Repository<EmailVerificationToken> {
    return database.getRepository(EmailVerificationToken);
  }

  // Gerar e persistir um token de confirmação
  async createToken(userId: number): Promise<string> {
    const token = randomBytes(32).toString("hex");

    const tokenHash = createHash("sha256").update(token).digest("hex");

    const expiresAt = new Date(
      Date.now() + TOKEN_EXPIRATION_MINUTES * 60 * 1000,
    );

    const verificationToken = this.tokenRepository.create({
      user: { id: userId },
      tokenHash,
      expiresAt,
      consumedAt: null,
    });

    await this.tokenRepository.save(verificationToken);

    return token;
  }

  async verifyToken(token: string): Promise<void> {
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const verificationToken = await this.tokenRepository.findOne({
      where: { tokenHash },
      relations: { user: true },
    });

    if (!verificationToken) {
      throw new AppError("Token de confirmação inválido.", 400);
    }

    if (verificationToken.consumedAt !== null) {
      throw new AppError("Este token já foi utilizado.", 400);
    }

    if (verificationToken.expiresAt.getTime() <= Date.now()) {
      throw new AppError("Este token expirou.", 400);
    }

    await userService.verifyEmail(verificationToken.user.id);

    verificationToken.consumedAt = new Date();

    await this.tokenRepository.save(verificationToken);
  }

  async invalidatePreviousTokens(userId: number): Promise<void> {
    await this.tokenRepository
      .createQueryBuilder()
      .update(EmailVerificationToken)
      .set({ consumedAt: new Date() })
      .where("user_id = :userId", { userId })
      .andWhere("consumed_at IS NULL")
      .execute();
  }

  // Pegar data do último token criado
  async getLatestTokenCreationDate(userId: number): Promise<Date | null> {
    const token = await this.tokenRepository.findOne({
      where: {
        user: { id: userId },
      },
      order: {
        createdAt: "DESC",
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    return token?.createdAt ?? null;
  }
}

export default new EmailVerificationService();
