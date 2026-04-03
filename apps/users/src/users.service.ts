import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { PinoLogger } from 'nestjs-pino';
import * as bcrypt from 'bcrypt';
import { PrismaService } from './prisma.service';
import { firstValueFrom, Observable } from 'rxjs';

type UserRecord = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
};

interface WalletServiceClient {
  CreateWallet(data: { userId: string }): Observable<{
    success: boolean;
    message: string;
    wallet?: { id: string; userId: string; balance: number; createdAt: string };
  }>;
}

const BCRYPT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

@Injectable()
export class UsersService implements OnModuleInit {
  private walletService!: WalletServiceClient;

  constructor(
    private readonly prisma: PrismaService,
    @Inject('WALLET_SERVICE') private readonly walletClient: ClientGrpc,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(UsersService.name);
  }

  onModuleInit() {
    this.walletService = this.walletClient.getService<WalletServiceClient>('WalletService');
  }

  private serializePublic(user: UserRecord) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async createUser(data: { email: string; name: string; password: string }) {
    const email = data.email?.trim().toLowerCase();
    const name = data.name?.trim();
    const password = data.password;

    if (!email || !name) {
      throw new RpcException({ code: 3, message: 'email and name are required' });
    }

    if (!password || typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
      throw new RpcException({
        code: 3,
        message: `password is required and must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new RpcException({ code: 6, message: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: { email, name, passwordHash },
    });

    try {
      await firstValueFrom(this.walletService.CreateWallet({ userId: user.id }));
    } catch (error: any) {
      this.logger.error(`Wallet auto-creation failed for user ${user.id}`, error?.stack || error?.message);
      await this.prisma.user.delete({ where: { id: user.id } });
      throw new RpcException({
        code: 13,
        message: 'User creation failed because wallet auto-creation did not complete',
      });
    }

    return {
      success: true,
      message: 'User created successfully',
      user: this.serializePublic(user),
    };
  }

  async getUserById(data: { id: string }) {
    const id = data.id?.trim();
    if (!id) {
      throw new RpcException({ code: 3, message: 'id is required' });
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new RpcException({ code: 5, message: 'User not found' });
    }

    return {
      success: true,
      message: 'User fetched successfully',
      user: this.serializePublic(user),
    };
  }

  async getAllUsers() {
    const users = await this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });

    return {
      success: true,
      message: 'Users fetched successfully',
      users: users.map((u) => this.serializePublic(u)),
    };
  }
}
