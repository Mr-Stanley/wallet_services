import { HttpException, HttpStatus } from '@nestjs/common';

export class WalletNotFoundException extends HttpException {
  constructor(walletId: string) {
    super(`Wallet with id ${walletId} not found`, HttpStatus.NOT_FOUND);
  }
}

export class InsufficientBalanceException extends HttpException {
  constructor(balance: number, amount: number) {
    super(
      `Insufficient balance. Current balance: ${balance}, Required: ${amount}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InvalidTransferException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class WalletAlreadyExistsException extends HttpException {
  constructor(walletId: string) {
    super(`Wallet with id ${walletId} already exists`, HttpStatus.CONFLICT);
  }
}

export class DuplicateOperationException extends HttpException {
  constructor() {
    super(
      'This operation has already been processed (duplicate idempotency key)',
      HttpStatus.CONFLICT,
    );
  }
}

