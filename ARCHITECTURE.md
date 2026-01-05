# Crypto Tax Estimation Dashboard - Architecture

## High-Level Architecture

```
┌─────────────────┐
│   React UI      │  User enters wallet address + selects chain
│   (TypeScript)  │
└────────┬────────┘
         │ HTTP Request
         ▼
┌─────────────────┐
│  Next.js API    │  /api/calculate-tax
│  Routes/Express │
└────────┬────────┘
         │
         ├──► Etherscan API ──► Fetch transactions
         │
         ├──► CoinGecko API ──► Fetch historical prices
         │
         └──► PnL Calculator ──► FIFO accounting logic
                 │
                 └──► Return: gains, losses, tax estimate
```

## Data Flow

1. **User Input**
   - Wallet address (Ethereum)
   - Chain selector (Ethereum only for MVP)

2. **Transaction Fetching**
   - Call Etherscan API: `getTransactions(address)`
   - Filter for ERC-20 token transfers (swaps, buys, sells)
   - Parse transaction data: token addresses, amounts, timestamps

3. **Price Fetching**
   - For each transaction, fetch historical token price at transaction timestamp
   - Use CoinGecko API: `getHistoricalPrice(tokenAddress, timestamp)`
   - Store price in USD for calculations

4. **PnL Calculation (FIFO)**
   - Process transactions chronologically
   - Maintain FIFO queues per token
   - On sell/swap: match against oldest holdings first
   - Calculate realized gain/loss = (sale_price - cost_basis) * amount

5. **Tax Calculation**
   - Sum all realized gains
   - Sum all realized losses
   - Net taxable gain = total_gains - total_losses
   - Tax due = net_taxable_gain * 0.33 (33% Ireland rate)

6. **Response**
   - Return structured data to frontend
   - Display in clear, simple UI

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Backend**: Next.js API routes (or Express.js)
- **APIs**:
  - Etherscan API (free tier: 5 calls/sec)
  - CoinGecko API (free tier: 10-50 calls/min)
- **Styling**: CSS Modules or Tailwind (simple, desktop-first)

## Project Structure

```
crypto-tax-dashboard/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── WalletInput.tsx
│   │   │   ├── ChainSelector.tsx
│   │   │   ├── TaxResults.tsx
│   │   │   └── Disclaimer.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── etherscan.ts
│   │   │   ├── coingecko.ts
│   │   │   └── pnlCalculator.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── api/
│   │       └── calculate-tax.ts
│   ├── package.json
│   └── tsconfig.json
├── shared/
│   └── types.ts
└── README.md
```

## Key Design Decisions

1. **FIFO Accounting**: First-In-First-Out ensures oldest tokens are sold first
2. **No Database**: MVP uses in-memory calculations only
3. **Rate Limiting**: Implement caching and rate limit handling for API calls
4. **Error Handling**: Graceful degradation if APIs fail
5. **Desktop-First**: Simple, clean UI optimized for desktop screens

## Limitations (MVP v1)

- Ethereum only (no multi-chain)
- ERC-20 tokens only (no NFTs, no native ETH transfers)
- No gas fee accounting
- No staking rewards
- No airdrops
- Simplified tax rules (no exemptions, no allowances)
- No historical data persistence
- Rate limits may cause delays for large wallets

## Next Steps (Post-MVP)

- Add more chains (Polygon, BSC, Arbitrum)
- Support native ETH transactions
- Add gas fee accounting
- Support NFTs
- Add more tax jurisdictions
- Implement caching layer
- Add transaction export (CSV)
- Add detailed transaction breakdown view

