import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import helmet from 'helmet';

import { AppModule } from './app/app.module';
import { setupSwagger } from './swagger';

async function bootstrap() {
  console.log('Loading environment variables...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, new ExpressAdapter(express()), {
    cors: true,
  });

  const configService = app.get(ConfigService);

  // Логируем конфигурацию для отладки
  logger.debug('RabbitMQ Config:', {
    uri: configService.get('rmq.uri'),
    queue: configService.get('rmq.auth'),
  });

  // Настраиваем микросервис
  const rmqUri = configService.get<string>('rmq.uri');
  if (!rmqUri) {
    throw new Error('RABBITMQ_URL is not defined');
  }

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [rmqUri],
      queue: configService.get<string>('rmq.auth'),
      queueOptions: {
        durable: true,
        arguments: {
          'x-message-ttl': 3600000,
        },
      },
    },
  });

  // Настройка приложения
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');

  if (configService.get('app.versioning.enable')) {
    app.enableVersioning({
      type: VersioningType.URI,
      prefix: 'v',
      defaultVersion: configService.get('app.versioning.version'),
    });
  }

  setupSwagger(app);

  try {
    await app.startAllMicroservices();
    logger.log('Microservice is listening');

    const port = configService.get<number>('app.port') || 3000;
    const host = configService.get<string>('app.http.host');
    
    await app.listen(port, host);
    logger.log(`🚀 @backendworks/auth service started on port ${port}`);
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
