import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  name: process.env.APP_NAME ?? 'auth',
  env: process.env.APP_ENV ?? 'development',
  versioning: {
    enable: process.env.HTTP_VERSIONING_ENABLE === 'true' ?? false,
    prefix: 'v',
    version: process.env.HTTP_VERSION ?? '1',
  },
  globalPrefix: '/api',
  http: {
    enable: process.env.HTTP_ENABLE === 'true' ?? false,
    host: process.env.HTTP_HOST ?? '0.0.0.0',
    port: process.env.HTTP_PORT ? Number.parseInt(process.env.HTTP_PORT) : 9001,
  },
  swagger: {
    path: 'docs',
    enable: process.env.SWAGGER_ENABLE === 'true' ?? true,
  }
}));
