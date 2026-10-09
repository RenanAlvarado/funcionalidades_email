import { createHash, randomBytes } from "node:crypto";
import { Repository } from "typeorm";
import database from "../../config/database";
import AppError from "../../errors/AppError";
import { PasswordResetToken } from "./passwordResetToken.entity";
import UserService from "../user/userService";

const TOKEN_EXPIRATION_MINUTES = 30;

class PasswordResetService {
  private get tokenRepository(): Repository<PasswordResetToken> {
    return database.getRepository(PasswordResetToken);
  }

  async createToken(userId: number): Promise<string> {
    const token = randomBytes(32).toString("hex");

    const tokenHash = createHash("sha256").update(token).digest("hex");

    const expiresAt = new Date(
      Date.now() + TOKEN_EXPIRATION_MINUTES * 60 * 1000,
    );

    const resetToken = this.tokenRepository.create({
      user: { id: userId },
      tokenHash,
      expiresAt,
      consumedAt: null,
    });

    await this.tokenRepository.save(resetToken);

    return token;
  }

  async invalidatePreviousTokens(userId: number): Promise<void> {
    await this.tokenRepository
      .createQueryBuilder()
      .update(PasswordResetToken)
      .set({ consumedAt: new Date() })
      .where("user_id = :userId", { userId })
      .andWhere("consumed_at IS NULL")
      .execute();
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const resetToken = await this.tokenRepository.findOne({
      where: { tokenHash },
      relations: { user: true },
    });

    if (!resetToken) {
      throw new AppError("Token de redefinição inválido.", 400);
    }

    if (resetToken.consumedAt !== null) {
      throw new AppError("Este token já foi utilizado.", 400);
    }

    if (resetToken.expiresAt.getTime() <= Date.now()) {
      throw new AppError("Este token expirou.", 400);
    }

    await UserService.updatePassword(resetToken.user.id, newPassword);

    await this.tokenRepository
      .createQueryBuilder()
      .update(PasswordResetToken)
      .set({ consumedAt: new Date() })
      .where("user_id = :userId", {
        userId: resetToken.user.id,
      })
      .andWhere("consumed_at IS NULL")
      .execute();
  }

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

export default new PasswordResetService();
