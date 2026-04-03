import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { PrismaService } from './prisma.service';
import { firstValueFrom, Observable } from 'rxjs';

type WalletRecord = {
  id: string;
  userId: string;
  balance: number;
  createdAt: Date;
};

interface UserServiceClient {
  GetUserById(data: { id: string }): Observable<{
    success: boolean;
    message: string;
    user?: { id: string; email: string; name: string; createdAt: string };
  }>;
}

@Injectable()
export class WalletService implements OnModuleInit {
  private userService!: UserServiceClient;

  constructor(
    private readonly prisma: PrismaService,
    @Inject('USER_SERVICE') private readonly userClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.userService = this.userClient.getService<UserServiceClient>('UserService');
  }

  private serialize(wallet: WalletRecord) {
    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: wallet.balance,
      createdAt: wallet.createdAt.toISOString(),
    };
  }

  private async ensureUserExists(userId: string) {
    try {
      const res = await firstValueFrom(this.userService.GetUserById({ id: userId }));
      if (!res?.success || !res?.user) {
        throw new RpcException({ code: 5, message: 'User not found' });
      }
    } catch {
      throw new RpcException({ code: 5, message: 'User not found' });
    }
  }

  async createWallet(data: { userId: string }) {
    const userId = data.userId?.trim();
    if (!userId) {
      throw new RpcException({ code: 3, message: 'userId is required' });
    }

    const existing = await this.prisma.wallet.findUnique({ where: { userId } });
    if (existing) {
      return {
        success: true,
        message: 'Wallet already exists',
        wallet: this.serialize(existing),
      };
    }

    await this.ensureUserExists(userId);

    const wallet = await this.prisma.wallet.create({
      data: {
        userId,
        balance: 0,
      },
    });

    return {
      success: true,
      message: 'Wallet created successfully',
      wallet: this.serialize(wallet),
    };
  }

  async getWallet(data: { userId: string }) {
    const userId = data.userId?.trim();
    if (!userId) {
      throw new RpcException({ code: 3, message: 'userId is required' });
    }

    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      throw new RpcException({ code: 5, message: 'Wallet not found' });
    }

    return {
      success: true,
      message: 'Wallet fetched successfully',
      wallet: this.serialize(wallet),
    };
  }

  async creditWallet(data: { userId: string; amount: number }) {
    const userId = data.userId?.trim();
    const amount = Number(data.amount);

    if (!userId) {
      throw new RpcException({ code: 3, message: 'userId is required' });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new RpcException({ code: 3, message: 'amount must be greater than 0' });
    }

    const wallet = await this.prisma.wallet.update({
      where: { userId },
      data: {
        balance: {
          increment: amount,
        },
      },
    }).catch(() => null);

    if (!wallet) {
      throw new RpcException({ code: 5, message: 'Wallet not found' });
    }

    return {
      success: true,
      message: 'Wallet credited successfully',
      wallet: this.serialize(wallet),
    };
  }

  async debitWallet(data: { userId: string; amount: number }) {
    const userId = data.userId?.trim();
    const amount = Number(data.amount);

    if (!userId) {
      throw new RpcException({ code: 3, message: 'userId is required' });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new RpcException({ code: 3, message: 'amount must be greater than 0' });
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });

      if (!wallet) {
        throw new RpcException({ code: 5, message: 'Wallet not found' });
      }

      if (wallet.balance < amount) {
        throw new RpcException({ code: 9, message: 'Insufficient balance' });
      }

      return tx.wallet.update({
        where: { userId },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });
    });

    return {
      success: true,
      message: 'Wallet debited successfully',
      wallet: this.serialize(result),
    };
  }
}
