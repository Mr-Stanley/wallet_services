import { Module } from '@nestjs/common';
import { WalletController } from '../controllers/walletController';
import { WalletService } from '../service/walletService';

@Module({
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}

