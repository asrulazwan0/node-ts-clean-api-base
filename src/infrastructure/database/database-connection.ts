import 'reflect-metadata';
import type { DataSource } from 'typeorm';
import { type AppConfig } from '../config/app-config';
import { createDataSource } from './data-source';

export class DatabaseConnection {
  private readonly dataSource: DataSource;

  constructor(config: AppConfig) {
    this.dataSource = createDataSource(config);
  }

  async connect(): Promise<void> {
    if (!this.dataSource.isInitialized) await this.dataSource.initialize();
  }

  async disconnect(): Promise<void> {
    if (this.dataSource.isInitialized) await this.dataSource.destroy();
  }

  async isReady(): Promise<boolean> {
    if (!this.dataSource.isInitialized) return false;
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }
}
