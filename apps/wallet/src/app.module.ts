import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { createPinoParams } from '@backend/logger';
import { PROTO_PATHS } from '@backend/proto';
import { PrismaService } from './prisma.service';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [
    LoggerModule.forRoot(createPinoParams('wallet')),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
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
      },
    ]),
  ],
  controllers: [WalletController],
  providers: [PrismaService, WalletService],
})
export class AppModule {}
