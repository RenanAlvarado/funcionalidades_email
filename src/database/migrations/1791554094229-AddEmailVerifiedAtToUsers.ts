import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmailVerifiedAtToUsers1791554094229 implements MigrationInterface {
  name = "AddEmailVerifiedAtToUsers1791554094229";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`email_verified_at\` datetime NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`email_verified_at\``,
    );
  }
}
