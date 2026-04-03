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
      package: 'wallet',
      protoPath: PROTO_PATHS.wallet,
      url: process.env.WALLET_SERVICE_URL || '0.0.0.0:50052',
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
  app.get(Logger).log(`Wallet service listening on ${process.env.WALLET_SERVICE_URL || '0.0.0.0:50052'}`);
}

bootstrap();
