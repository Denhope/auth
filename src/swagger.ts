import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';

export const setupSwagger = async (app: INestApplication) => {
  const configService = app.get(ConfigService);
  const logger = new Logger();
  const appConfig = configService.get('app');

  const documentBuild = new DocumentBuilder()
    .setTitle(appConfig.name)
    .setDescription('The Auth API description')
    .setVersion(appConfig.versioning.version)
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'accessToken',
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'refreshToken',
    )
    .build();

  const document = SwaggerModule.createDocument(app, documentBuild, {
    deepScanRoutes: true,
  });

  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      docExpansion: 'none',
      persistAuthorization: true,
      displayOperationId: true,
      operationsSorter: 'method',
      tagsSorter: 'alpha',
      tryItOutEnabled: true,
      filter: true,
    },
  };

  const swaggerPath = 'api/docs';
  
  SwaggerModule.setup(swaggerPath, app, document, {
    explorer: true,
    customSiteTitle: appConfig.name,
    ...customOptions,
  });

  logger.log(`Docs will serve on /${swaggerPath}`, 'NestApplication');
};
