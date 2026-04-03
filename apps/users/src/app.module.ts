import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { createPinoParams } from '@ass-end/logger';
import { PROTO_PATHS } from '@ass-end/proto';
import { PrismaService } from './prisma.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    LoggerModule.forRoot(createPinoParams('users')),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),
    ClientsModule.register([
      {
        name: 'WALLET_SERVICE',
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
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [PrismaService, UsersService],
})
export class AppModule {}
