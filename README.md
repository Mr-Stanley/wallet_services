# Wallet Service API

A RESTful API service for managing wallets, funding, and transfers.

## Features

- Create wallets with unique IDs
- Fund wallets with positive amounts
- Transfer funds between wallets
- Fetch wallet details with transaction history
- Input validation and error handling
- Idempotency support for fund/transfer operations
- Transaction history tracking

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

### Running Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## API Endpoints

1. **Create Wallet** - `POST /wallets`
2. **Fund Wallet** - `POST /wallets/:id/fund`
3. **Transfer Between Wallets** - `POST /wallets/transfer`
4. **Fetch Wallet Details** - `GET /wallets/:id`

## Assumptions Made

1. **Currency**: Currently only supports USD. The system is designed to be extensible for multiple currencies in the future.

2. **Storage**: Uses in-memory storage (Map data structures) for simplicity. All data is lost on server restart.

3. **Balance Precision**: JavaScript numbers are used for balances. For production, consider using a decimal library to avoid floating-point precision issues.

4. **Transaction Keys**: Stored in memory. In production, these should be stored in a persistent store (e.g., Redis) with TTL.

5. **Transaction IDs**: Generated using timestamp and random string. In production, consider using UUIDs or database-generated IDs.
