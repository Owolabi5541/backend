import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Gateway');

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Wallet Assessment Gateway')
    .setDescription('HTTP gateway for User and Wallet microservices')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.GATEWAY_PORT || 3000);
  await app.listen(port);

  logger.log(`Gateway running on http://localhost:${port}`);
  logger.log(`REST API base: http://localhost:${port}/api`);
  logger.log(`Swagger UI: http://localhost:${port}/docs`);
}

bootstrap();
