import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '@/entities/User';
import { Proposal } from '@/entities/Proposal';

const isDevelopment = process.env.NODE_ENV === 'development';
const databaseUrl = process.env.DATABASE_URL || 'sqlite:./database.sqlite';

const isPostgres = databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://');

export const AppDataSource = new DataSource({
  type: isPostgres ? 'postgres' : 'sqlite',
  url: isPostgres ? databaseUrl : undefined,
  database: isPostgres ? undefined : databaseUrl.replace('sqlite:', ''),
  synchronize: true,
  logging: isDevelopment,
  entities: [User, Proposal],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
});

let isInitialized = false;

export async function initializeDatabase() {
  if (isInitialized) {
    return AppDataSource;
  }

  try {
    await AppDataSource.initialize();
    isInitialized = true;
    console.log('🗄️  Database connection established');
    return AppDataSource;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function getDatabase() {
  if (!isInitialized) {
    await initializeDatabase();
  }
  return AppDataSource;
}