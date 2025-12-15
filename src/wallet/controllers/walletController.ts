import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WalletService } from '../service/walletService';
import { CreateWalletDto } from '../dto/createWallet';
import { FundWalletDto } from '../dto/fundWallet';
import { TransferDto } from '../dto/transfer';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createWallet(@Body() createWalletDto: CreateWalletDto) {
    return this.walletService.createWallet(
      createWalletDto.id,
      createWalletDto.currency || 'USD',
    );
  }

  @Post(':id/fund')
  @HttpCode(HttpStatus.OK)
  fundWallet(
    @Param('id') walletId: string,
    @Body() fundWalletDto: FundWalletDto,
  ) {
    return this.walletService.fundWallet(
      walletId,
      fundWalletDto.amount,
      fundWalletDto.idempotencyKey,
    );
  }

  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  transfer(@Body() transferDto: TransferDto) {
    return this.walletService.transfer(
      transferDto.fromWalletId,
      transferDto.toWalletId,
      transferDto.amount,
      transferDto.idempotencyKey,
    );
  }

  @Get(':id')
  getWalletDetails(@Param('id') walletId: string) {
    return this.walletService.getWalletDetails(walletId);
  }
}

