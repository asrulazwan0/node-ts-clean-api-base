import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { join } from 'node:path';
import type { AppConfig } from '../config/app-config';
import { UserEntity } from './entities/user.entity';

export function createDataSource(config: AppConfig): DataSource {
  return new DataSource({
    type: 'postgres',
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    entities: [UserEntity],
    migrations: [join(__dirname, 'migrations', __filename.endsWith('.ts') ? '*.ts' : '*.js')],
    synchronize: false,
    migrationsRun: false,
    logging: false,
    connectTimeoutMS: config.DB_CONNECT_TIMEOUT_MS,
    extra: { query_timeout: config.DB_CONNECT_TIMEOUT_MS },
  });
}
