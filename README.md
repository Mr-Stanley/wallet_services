

A RESTful API service for managing wallets, funding, and transfers.

Features includes

Create wallets with unique IDs
Fund wallets with positive amounts
Transfer funds between wallets
Fetch wallet details with transaction history
Input validation and error handling
Idempotency support for fund/transfer operations
Transaction history tracking

Setup Instructions :


- Node.js (v18 or higher)
- npm or yarn

Installation

1. Install dependencies:

npm install


2. Start the development server:

npm run start:dev


The API will be available at `http://localhost:3000`

Running Tests

Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## API Endpoints

1. Create Wallet
2. Fund Wallet

3. Transfer Between Wallets
4. Fetch Wallet Details


Assumptions Made

1. Currency: Currently only supports USD. The system is designed to be extensible for multiple currencies in the future.

2. Storage: Uses in-memory storage (Map data structures) for simplicity. All data is lost on server restart.

3. Balance Precision: JavaScript numbers are used for balances. 

4. Transaction Keys: Stored in memory. 

5. Transaction IDs: Generated using timestamp and random string. 



