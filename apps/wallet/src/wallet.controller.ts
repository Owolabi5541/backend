import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { WalletService } from './wallet.service';

@Controller()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @GrpcMethod('WalletService', 'CreateWallet')
  createWallet(data: { userId: string }) {
    return this.walletService.createWallet(data);
  }

  @GrpcMethod('WalletService', 'GetWallet')
  getWallet(data: { userId: string }) {
    return this.walletService.getWallet(data);
  }

  @GrpcMethod('WalletService', 'CreditWallet')
  creditWallet(data: { userId: string; amount: number }) {
    return this.walletService.creditWallet(data);
  }

  @GrpcMethod('WalletService', 'DebitWallet')
  debitWallet(data: { userId: string; amount: number }) {
    return this.walletService.debitWallet(data);
  }
}
