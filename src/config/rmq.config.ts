import { registerAs } from '@nestjs/config';

export const rmqConfig = registerAs('rmq', () => ({
  uri: process.env.RABBITMQ_URL || 'amqp://admin:master123@localhost:5672',
  queue: process.env.RABBITMQ_AUTH_QUEUE || 'auth_queue',
}));
