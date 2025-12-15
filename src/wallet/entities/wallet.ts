export interface Wallet {
  id: string;
  currency: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: 'FUND' | 'TRANSFER_OUT' | 'TRANSFER_IN';
  amount: number;
  relatedWalletId?: string; // For transfers
  timestamp: Date;
}

