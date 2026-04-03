import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
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
  });

  const logger = new Logger('Wallet');
  await app.listen();
  logger.log(`Wallet service listening on ${process.env.WALLET_SERVICE_URL || '0.0.0.0:50052'}`);
}

bootstrap();
