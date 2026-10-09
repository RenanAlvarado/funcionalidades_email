import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmailVerificationTokens1791554242350 implements MigrationInterface {
  name = "CreateEmailVerificationTokens1791554242350";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`email_verification_tokens\` (\`id\` int NOT NULL AUTO_INCREMENT, \`token_hash\` char(64) NOT NULL, \`expires_at\` datetime NOT NULL, \`consumed_at\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`user_id\` int NOT NULL, UNIQUE INDEX \`IDX_c20ed35f3d31d486aabcd0564d\` (\`token_hash\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`email_verification_tokens\` ADD CONSTRAINT \`FK_fdcb77f72f529bf65c95d72a147\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`email_verification_tokens\` DROP FOREIGN KEY \`FK_fdcb77f72f529bf65c95d72a147\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_c20ed35f3d31d486aabcd0564d\` ON \`email_verification_tokens\``,
    );
    await queryRunner.query(`DROP TABLE \`email_verification_tokens\``);
  }
}
