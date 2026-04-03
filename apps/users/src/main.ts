import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';
import { PROTO_PATHS } from '@ass-end/proto';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: PROTO_PATHS.user,
      url: process.env.USER_SERVICE_URL || '0.0.0.0:50051',
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    },
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));
  await app.listen();
  app.get(Logger).log(`Users service listening on ${process.env.USER_SERVICE_URL || '0.0.0.0:50051'}`);
}

bootstrap();
