import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1780000000000 implements MigrationInterface {
  name = 'CreateUsers1780000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Intentionally fails if a legacy table exists; never adopt or discard unknown data.
    await queryRunner.query(`CREATE TABLE "users" (
      "id" uuid NOT NULL,
      "email" varchar(254) NOT NULL,
      "name" varchar(100) NOT NULL,
      "createdAt" timestamptz NOT NULL,
      "updatedAt" timestamptz NOT NULL,
      CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
      CONSTRAINT "UQ_users_email" UNIQUE ("email")
    )`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "users"');
  }
}
