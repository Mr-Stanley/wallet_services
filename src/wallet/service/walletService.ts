import { Injectable } from '@nestjs/common';
import { Wallet, Transaction } from '../entities/wallet';
import {
  WalletNotFoundException,
  InsufficientBalanceException,
  InvalidTransferException,
  WalletAlreadyExistsException,
  DuplicateOperationException,
} from '../exceptions/walletExceptions';

@Injectable()
export class WalletService {
  private wallets: Map<string, Wallet> = new Map();
  private transactions: Map<string, Transaction[]> = new Map();
  private transactionKeys: Set<string> = new Set();

  createWallet(id: string, currency: string = 'USD'): Wallet {
    if (this.wallets.has(id)) {
      throw new WalletAlreadyExistsException(id);
    }

    const wallet: Wallet = {
      id,
      currency,
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.wallets.set(id, wallet);
    this.transactions.set(id, []);

    return wallet;
  }

  fundWallet(
    walletId: string,
    amount: number,
    transactionKey?: string,
  ): Wallet {
    // Check idempotency
    if (transactionKey && this.transactionKeys.has(transactionKey)) {
      throw new DuplicateOperationException();
    }

    const wallet = this.wallets.get(walletId);
    if (!wallet) {
      throw new WalletNotFoundException(walletId);
    }

    // Record idempotency key before processing
    if (transactionKey) {
      this.transactionKeys.add(transactionKey);
    }

    // Update wallet balance
    wallet.balance += amount;
    wallet.updatedAt = new Date();

    // Record transaction
    const transaction: Transaction = {
      id: this.generateTransactionId(),
      walletId,
      type: 'FUND',
      amount,
      timestamp: new Date(),
    };

    this.transactions.get(walletId)!.push(transaction);

    return wallet;
  }

  transfer(
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    transactionKey?: string,
  ): { fromWallet: Wallet; toWallet: Wallet } {
    // Check idempotency
    if (transactionKey && this.transactionKeys.has(transactionKey)) {
      throw new DuplicateOperationException();
    }

    if (fromWalletId === toWalletId) {
      throw new InvalidTransferException(
        'Cannot transfer to the same wallet',
      );
    }

    const fromWallet = this.wallets.get(fromWalletId);
    if (!fromWallet) {
      throw new WalletNotFoundException(fromWalletId);
    }

    const toWallet = this.wallets.get(toWalletId);
    if (!toWallet) {
      throw new WalletNotFoundException(toWalletId);
    }

    if (fromWallet.balance < amount) {
      throw new InsufficientBalanceException(fromWallet.balance, amount);
    }

    // Record idempotency key before processing
    if (transactionKey) {
      this.transactionKeys.add(transactionKey);
    }

    // Update balances
    fromWallet.balance -= amount;
    fromWallet.updatedAt = new Date();
    toWallet.balance += amount;
    toWallet.updatedAt = new Date();

    // Record transactions
    const timestamp = new Date();
    const transferOutTransaction: Transaction = {
      id: this.generateTransactionId(),
      walletId: fromWalletId,
      type: 'TRANSFER_OUT',
      amount,
      relatedWalletId: toWalletId,
      timestamp,
    };

    const transferInTransaction: Transaction = {
      id: this.generateTransactionId(),
      walletId: toWalletId,
      type: 'TRANSFER_IN',
      amount,
      relatedWalletId: fromWalletId,
      timestamp,
    };

    this.transactions.get(fromWalletId)!.push(transferOutTransaction);
    this.transactions.get(toWalletId)!.push(transferInTransaction);

    return { fromWallet, toWallet };
  }

  getWallet(walletId: string): Wallet {
    const wallet = this.wallets.get(walletId);
    if (!wallet) {
      throw new WalletNotFoundException(walletId);
    }
    return wallet;
  }

  getWalletTransactions(walletId: string): Transaction[] {
    if (!this.wallets.has(walletId)) {
      throw new WalletNotFoundException(walletId);
    }
    return this.transactions.get(walletId) || [];
  }

  getWalletDetails(walletId: string): {
    wallet: Wallet;
    transactions: Transaction[];
  } {
    const wallet = this.getWallet(walletId);
    const transactions = this.getWalletTransactions(walletId);
    return { wallet, transactions };
  }

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

