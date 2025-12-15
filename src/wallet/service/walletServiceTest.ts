import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './walletService';
import {
  WalletNotFoundException,
  InsufficientBalanceException,
  InvalidTransferException,
  WalletAlreadyExistsException,
  DuplicateOperationException,
} from '../exceptions/walletExceptions';

describe('WalletService', () => {
  let service: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletService],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  afterEach(() => {
    // Clear all wallets and transactions between tests
    (service as any).wallets.clear();
    (service as any).transactions.clear();
    (service as any).transactionKeys.clear();
  });

  describe('createWallet', () => {
    it('should create a wallet successfully', () => {
      const wallet = service.createWallet('wallet1', 'USD');

      expect(wallet).toBeDefined();
      expect(wallet.id).toBe('wallet1');
      expect(wallet.currency).toBe('USD');
      expect(wallet.balance).toBe(0);
      expect(wallet.createdAt).toBeInstanceOf(Date);
    });

    it('should default currency to USD if not provided', () => {
      const wallet = service.createWallet('wallet2');

      expect(wallet.currency).toBe('USD');
    });

    it('should throw error if wallet already exists', () => {
      service.createWallet('wallet3');

      expect(() => service.createWallet('wallet3')).toThrow(
        WalletAlreadyExistsException,
      );
    });
  });

  describe('fundWallet', () => {
    beforeEach(() => {
      service.createWallet('wallet1');
    });

    it('should fund wallet successfully', () => {
      const wallet = service.fundWallet('wallet1', 100);

      expect(wallet.balance).toBe(100);
    });

    it('should add to existing balance', () => {
      service.fundWallet('wallet1', 50);
      const wallet = service.fundWallet('wallet1', 25);

      expect(wallet.balance).toBe(75);
    });

    it('should throw error if wallet not found', () => {
      expect(() => service.fundWallet('nonexistent', 100)).toThrow(
        WalletNotFoundException,
      );
    });

    it('should create transaction record', () => {
      service.fundWallet('wallet1', 100);
      const transactions = service.getWalletTransactions('wallet1');

      expect(transactions).toHaveLength(1);
      expect(transactions[0].type).toBe('FUND');
      expect(transactions[0].amount).toBe(100);
    });

    it('should prevent duplicate operations with transaction key', () => {
      const transactionKey = 'key123';
      service.fundWallet('wallet1', 100, transactionKey);

      expect(() =>
        service.fundWallet('wallet1', 100, transactionKey),
      ).toThrow(DuplicateOperationException);
    });
  });

  describe('transfer', () => {
    beforeEach(() => {
      service.createWallet('wallet1');
      service.createWallet('wallet2');
      service.fundWallet('wallet1', 100);
    });

    it('should transfer funds successfully', () => {
      const result = service.transfer('wallet1', 'wallet2', 50);

      expect(result.fromWallet.balance).toBe(50);
      expect(result.toWallet.balance).toBe(50);
    });

    it('should throw error if sender wallet not found', () => {
      expect(() =>
        service.transfer('nonexistent', 'wallet2', 50),
      ).toThrow(WalletNotFoundException);
    });

    it('should throw error if receiver wallet not found', () => {
      expect(() =>
        service.transfer('wallet1', 'nonexistent', 50),
      ).toThrow(WalletNotFoundException);
    });

    it('should throw error if insufficient balance', () => {
      expect(() => service.transfer('wallet1', 'wallet2', 150)).toThrow(
        InsufficientBalanceException,
      );
    });

    it('should throw error if transferring to same wallet', () => {
      expect(() => service.transfer('wallet1', 'wallet1', 50)).toThrow(
        InvalidTransferException,
      );
    });

    it('should create transaction records for both wallets', () => {
      service.transfer('wallet1', 'wallet2', 50);

      const wallet1Transactions = service.getWalletTransactions('wallet1');
      const wallet2Transactions = service.getWalletTransactions('wallet2');

      expect(wallet1Transactions).toHaveLength(2); // FUND + TRANSFER_OUT
      expect(wallet2Transactions).toHaveLength(1); // TRANSFER_IN

      expect(wallet1Transactions[1].type).toBe('TRANSFER_OUT');
      expect(wallet2Transactions[0].type).toBe('TRANSFER_IN');
    });

    it('should prevent duplicate operations with transaction key', () => {
      const transactionKey = 'transfer123';
      service.transfer('wallet1', 'wallet2', 50, transactionKey);

      expect(() =>
        service.transfer('wallet1', 'wallet2', 50, transactionKey),
      ).toThrow(DuplicateOperationException);
    });
  });

  describe('getWallet', () => {
    it('should return wallet if exists', () => {
      service.createWallet('wallet1');
      const wallet = service.getWallet('wallet1');

      expect(wallet).toBeDefined();
      expect(wallet.id).toBe('wallet1');
    });

    it('should throw error if wallet not found', () => {
      expect(() => service.getWallet('nonexistent')).toThrow(
        WalletNotFoundException,
      );
    });
  });

  describe('getWalletDetails', () => {
    it('should return wallet with transactions', () => {
      service.createWallet('wallet1');
      service.fundWallet('wallet1', 100);
      service.fundWallet('wallet1', 50);

      const details = service.getWalletDetails('wallet1');

      expect(details.wallet).toBeDefined();
      expect(details.transactions).toHaveLength(2);
      expect(details.wallet.balance).toBe(150);
    });

    it('should throw error if wallet not found', () => {
      expect(() => service.getWalletDetails('nonexistent')).toThrow(
        WalletNotFoundException,
      );
    });
  });
});

