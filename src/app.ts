import { Module } from '@nestjs/common';
import { WalletModule } from './wallet/module/wallet';

@Module({
  imports: [WalletModule],
})
export class AppModule {}
