import { appConfig } from './app.config';
import { authConfig } from './auth.config';
import { databaseConfig } from './database.config';
import { rmqConfig } from './rmq.config';

export const configs = [
  appConfig,
  authConfig,
  databaseConfig,
  rmqConfig,
];
