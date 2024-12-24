import { registerAs } from '@nestjs/config';
import * as process from 'process';

export const databaseConfig = registerAs('database', () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is not defined in environment variables');
  }
  return {
    url: databaseUrl,
  };
}); 