# CompliFlow

A simple, utility-focused web application for estimating cryptocurrency tax liability using FIFO (First-In-First-Out) accounting.

## Overview

This MVP calculates estimated tax due on cryptocurrency transactions by:
1. Fetching on-chain transactions from Ethereum wallets
2. Retrieving historical token prices at transaction timestamps
3. Calculating realized gains/losses using FIFO accounting
4. Applying simplified Ireland tax rules (33% Capital Gains Tax)

## Features

- **No Authentication**: Simple, direct utility
- **No Payments**: Free to use
- **Desktop-First UI**: Clean, simple interface
- **FIFO Accounting**: Accurate cost basis tracking
- **Historical Price Data**: Uses CoinGecko for accurate pricing

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Backend**: Next.js API routes
- **APIs**: 
  - Etherscan (transaction data)
  - CoinGecko (historical prices)

## Project Structure

```
CompliFlow/
├── frontend/          # React frontend application
├── backend/           # Next.js backend with API routes
├── shared/            # Shared TypeScript types
├── ARCHITECTURE.md    # Detailed architecture documentation
├── DATA_MODEL.md      # Data model design
└── README.md          # This file
```

## Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- Free Etherscan API key ([Get one here](https://etherscan.io/apis))

### Installation

1. **Navigate to the project**:
   ```bash
   cd CompliFlow
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**:
   
   Create `backend/.env.local`:
   ```env
   ETHERSCAN_API_KEY=your_etherscan_api_key_here
   ```

### Running the Application

**Option 1: Run as separate frontend/backend** (for development):

1. Start the backend (Next.js):
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on `http://localhost:3000`

2. Start the frontend (React):
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on `http://localhost:3001` (or next available port)

   Update `frontend/src/App.tsx` to point to backend URL if needed.

**Option 2: Run as integrated Next.js app** (recommended):

1. Move frontend code into Next.js structure
2. Run `npm run dev` from backend directory
3. Access at `http://localhost:3000`

## Usage

1. Enter an Ethereum wallet address (0x...)
2. Select blockchain (Ethereum only in MVP)
3. Click "Calculate Tax Estimate"
4. View results:
   - Total Realized Gains
   - Total Realized Losses
   - Net Taxable Gain
   - Estimated Tax Due (33%)

## How It Works

### Data Flow

1. **Transaction Fetching**: Uses Etherscan API to fetch all ERC-20 token transfers
2. **Price Fetching**: Uses CoinGecko API to get historical USD prices at transaction timestamps
3. **FIFO Calculation**: Processes transactions chronologically, matching sells against oldest purchases
4. **Tax Calculation**: Applies 33% tax rate to net taxable gain

### FIFO Accounting

- When tokens are **bought/acquired**: Added to inventory queue
- When tokens are **sold/disposed**: Removed from inventory (oldest first)
- **Realized Gain/Loss** = (Sale Price - Cost Basis) × Amount
- **Net Taxable Gain** = Total Gains - Total Losses

## Limitations (MVP v1)

- ✅ Ethereum only (no multi-chain support)
- ✅ ERC-20 tokens only (no native ETH, no NFTs)
- ✅ No gas fee accounting
- ✅ No staking rewards or airdrops
- ✅ Simplified tax rules (no exemptions, no allowances)
- ✅ Rate limits may cause delays for large wallets
- ✅ No historical data persistence

## API Rate Limits

- **Etherscan**: 5 calls/second (free tier)
- **CoinGecko**: 10-50 calls/minute (free tier)

For wallets with many transactions, price fetching may take several minutes due to rate limiting.

## Core PnL Calculation Logic

The core calculation logic is in `backend/src/services/pnlCalculator.ts`:

- `calculatePnL()`: Main function that processes transactions
- `addToInventory()`: Adds tokens to FIFO queue
- `removeFromInventory()`: Removes tokens (oldest first) and calculates PnL

See `DATA_MODEL.md` for detailed data structure documentation.

## Next Steps (Post-MVP)

- [ ] Add more chains (Polygon, BSC, Arbitrum)
- [ ] Support native ETH transactions
- [ ] Add gas fee accounting
- [ ] Support NFTs
- [ ] Add more tax jurisdictions
- [ ] Implement caching layer
- [ ] Add transaction export (CSV)
- [ ] Add detailed transaction breakdown view
- [ ] Add progress indicators for long-running calculations

## Disclaimer

**This is an estimate only and does not constitute tax advice.** Tax calculations are based on simplified rules and may not reflect your actual tax liability. Consult with a qualified tax professional for accurate tax advice.

## License

MIT

