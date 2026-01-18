import { DataSource } from 'typeorm';
import { UserEntity } from './entities/user.entity';

export class DatabaseConnection {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'clean_api_db',
      entities: [UserEntity],
      synchronize: process.env.NODE_ENV !== 'production', // Only auto-sync in development
      logging: process.env.NODE_ENV !== 'production',
    });
  }

  async connect(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
      console.log('Database connected');
    }
  }

  async disconnect(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      console.log('Database disconnected');
    }
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }
}