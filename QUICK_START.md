# Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Free Etherscan API key ([Get one here](https://etherscan.io/apis))

## Setup (5 minutes)

1. **Get Etherscan API Key**:
   - Go to https://etherscan.io/apis
   - Sign up for free account
   - Create API key
   - Copy the key

2. **Install Dependencies**:

   ```bash
   # Backend
   cd backend
   npm install
   
   # Create .env.local file
   echo "ETHERSCAN_API_KEY=your_key_here" > .env.local
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Start Development Servers**:

   ```bash
   # Terminal 1: Backend (Next.js)
   cd backend
   npm run dev
   # Runs on http://localhost:3000
   
   # Terminal 2: Frontend (React)
   cd frontend
   npm run dev
   # Runs on http://localhost:3001
   ```

4. **Update Frontend API URL** (if needed):

   If running separately, update `frontend/src/App.tsx`:
   ```typescript
   const response = await fetch('http://localhost:3000/api/calculate-tax', {
     // ...
   });
   ```

## Test with a Real Wallet

1. Open http://localhost:3001 in your browser
2. Enter an Ethereum wallet address (e.g., `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`)
3. Select "Ethereum" as the chain
4. Click "Calculate Tax Estimate"
5. Wait for calculation (may take 1-5 minutes for wallets with many transactions)

## Project Structure Overview

```
CompliFlow/
├── backend/
│   ├── pages/api/calculate-tax.ts    # API endpoint
│   ├── src/services/
│   │   ├── pnlCalculator.ts          # Core FIFO logic ⭐
│   │   ├── etherscan.ts              # Transaction fetching
│   │   └── coingecko.ts              # Price fetching
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                   # Main component
│   │   ├── components/               # UI components
│   │   └── types/                    # TypeScript types
│   └── package.json
│
├── shared/
│   └── types.ts                      # Shared types
│
└── Documentation files
```

## Key Files to Understand

1. **`backend/src/services/pnlCalculator.ts`**: 
   - Core FIFO accounting logic
   - Well-commented, easy to understand
   - Start here to understand the calculation

2. **`backend/pages/api/calculate-tax.ts`**:
   - API endpoint that orchestrates everything
   - Good example of the data flow

3. **`frontend/src/App.tsx`**:
   - Main UI component
   - Handles form submission and results display

## Troubleshooting

**"Invalid Ethereum address format"**:
- Make sure address starts with `0x` and is 42 characters total
- Example: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`

**"Etherscan API error"**:
- Check your API key in `backend/.env.local`
- Verify API key is active on Etherscan
- Check rate limits (5 calls/second)

**"No transactions found"**:
- Wallet may have no ERC-20 token transfers
- Try a different wallet address
- Check address on Etherscan directly

**"No transactions with valid price data"**:
- Some tokens may not have historical price data on CoinGecko
- This is expected for obscure tokens
- Transactions without prices are skipped

**Long calculation times**:
- Normal for wallets with many transactions
- CoinGecko rate limiting (7 seconds between calls)
- Consider adding progress indicator (future enhancement)

## Next Steps

- Read `ARCHITECTURE.md` for system design
- Read `DATA_MODEL.md` for data structures
- Read `IMPLEMENTATION_NOTES.md` for detailed explanations
- Review `pnlCalculator.ts` to understand FIFO logic

