import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { mapGrpcError } from './grpc-error';

class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}

class AmountDto {
  @IsNumber()
  @IsPositive()
  amount!: number;
}

interface WalletServiceClient {
  CreateWallet(data: { userId: string }): Observable<any>;
  GetWallet(data: { userId: string }): Observable<any>;
  CreditWallet(data: { userId: string; amount: number }): Observable<any>;
  DebitWallet(data: { userId: string; amount: number }): Observable<any>;
}

@ApiTags('Wallets')
@Controller('wallets')
export class WalletHttpController {
  private readonly walletService: WalletServiceClient;

  constructor(@Inject('WALLET_SERVICE') private readonly walletClient: ClientGrpc) {
    this.walletService = this.walletClient.getService<WalletServiceClient>('WalletService');
  }

  @Post()
  @ApiOperation({ summary: 'Create wallet manually' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: { type: 'string', example: 'uuid-here' },
      },
    },
  })
  async createWallet(@Body() body: CreateWalletDto) {
    try {
      return await firstValueFrom(this.walletService.CreateWallet(body));
    } catch (error) {
      mapGrpcError(error);
    }
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get wallet by userId' })
  @ApiParam({ name: 'userId', example: 'uuid-here' })
  async getWallet(@Param('userId') userId: string) {
    try {
      return await firstValueFrom(this.walletService.GetWallet({ userId }));
    } catch (error) {
      mapGrpcError(error);
    }
  }

  @Post(':userId/credit')
  @ApiOperation({ summary: 'Credit wallet' })
  @ApiParam({ name: 'userId', example: 'uuid-here' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['amount'],
      properties: {
        amount: { type: 'number', example: 5000 },
      },
    },
  })
  async creditWallet(@Param('userId') userId: string, @Body() body: AmountDto) {
    try {
      return await firstValueFrom(this.walletService.CreditWallet({ userId, amount: body.amount }));
    } catch (error) {
      mapGrpcError(error);
    }
  }

  @Post(':userId/debit')
  @ApiOperation({ summary: 'Debit wallet' })
  @ApiParam({ name: 'userId', example: 'uuid-here' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['amount'],
      properties: {
        amount: { type: 'number', example: 2000 },
      },
    },
  })
  async debitWallet(@Param('userId') userId: string, @Body() body: AmountDto) {
    try {
      return await firstValueFrom(this.walletService.DebitWallet({ userId, amount: body.amount }));
    } catch (error) {
      mapGrpcError(error);
    }
  }
}
