import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
  jwtSecret: process.env.ACCESS_TOKEN_SECRET_KEY || 'temporary-secret-key',
  jwtRefreshSecret: process.env.REFRESH_TOKEN_SECRET_KEY || 'temporary-refresh-secret-key',
  jwtExpiresIn: process.env.ACCESS_TOKEN_EXPIRED || '1d',
  jwtRefreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRED || '7d',
}));
