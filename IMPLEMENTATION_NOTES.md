# Implementation Notes

## Core Components Summary

### 1. PnL Calculator (`backend/src/services/pnlCalculator.ts`)

**Purpose**: Implements FIFO accounting logic for calculating realized gains/losses.

**Key Functions**:
- `calculatePnL()`: Main entry point that processes transactions chronologically
- `addToInventory()`: Adds tokens to FIFO queue when bought/acquired
- `removeFromInventory()`: Removes tokens (oldest first) when sold and calculates PnL

**Algorithm**:
1. Sort all transactions by timestamp
2. For each transaction:
   - **Buy/Swap-In**: Add to inventory queue (newest at back)
   - **Sell/Swap-Out**: Remove from inventory queue (oldest at front), calculate gain/loss
3. Aggregate all realized gains and losses
4. Calculate tax: `(Net Taxable Gain) × 0.33`

**Edge Cases Handled**:
- Partial lot consumption (selling less than a full lot)
- Missing price data (skips transactions without valid prices)
- Insufficient holdings (warns but continues)

### 2. Etherscan Service (`backend/src/services/etherscan.ts`)

**Purpose**: Fetches ERC-20 token transfer transactions from Ethereum blockchain.

**API Endpoint**: `https://api.etherscan.io/api`

**Rate Limit**: 5 calls/second (free tier)

**Key Function**:
- `fetchTransactions()`: Fetches all token transfers for a wallet address

**Transaction Type Detection**:
- `buy`: Incoming transfer (to = wallet)
- `sell`: Outgoing transfer (from = wallet)
- `swap`: Both addresses match (self-transfer or DEX swap)

### 3. CoinGecko Service (`backend/src/services/coingecko.ts`)

**Purpose**: Fetches historical token prices at specific timestamps.

**API Endpoint**: `https://api.coingecko.com/api/v3`

**Rate Limit**: 10-50 calls/minute (free tier)

**Key Functions**:
- `fetchHistoricalPrice()`: Gets price for a token at a specific timestamp
- `fetchPricesForTransactions()`: Batch fetches prices with rate limiting

**Optimization**:
- Groups transactions by token and date to minimize API calls
- Caches prices per token per day
- Implements 7-second delay between calls to respect rate limits

### 4. API Route (`backend/pages/api/calculate-tax.ts`)

**Purpose**: Next.js API route that orchestrates the tax calculation.

**Flow**:
1. Validate input (wallet address, chain)
2. Fetch transactions from Etherscan
3. Fetch historical prices from CoinGecko
4. Calculate PnL using FIFO
5. Return results

**Error Handling**:
- Validates Ethereum address format
- Handles empty transaction lists
- Handles missing price data gracefully
- Returns appropriate HTTP status codes

### 5. Frontend Components

**WalletInput**: Text input with Ethereum address validation
**ChainSelector**: Dropdown (Ethereum only for MVP)
**TaxResults**: Displays calculated tax results in a grid
**Disclaimer**: Legal disclaimer about estimates

**App.tsx**: Main component that:
- Manages form state
- Calls API endpoint
- Displays results or errors
- Shows loading states

## Data Flow Diagram (Textual)

```
User Input (Wallet Address)
    │
    ▼
Frontend: App.tsx
    │
    ▼
POST /api/calculate-tax
    │
    ├─► Etherscan API
    │   └─► Returns: Array of Transactions
    │
    ├─► CoinGecko API (for each unique token/date)
    │   └─► Returns: Historical USD prices
    │
    └─► PnL Calculator
        │
        ├─► Sort transactions by timestamp
        ├─► Process each transaction:
        │   ├─► Buy: addToInventory()
        │   └─► Sell: removeFromInventory() → calculate gain/loss
        │
        └─► Aggregate results:
            ├─► Total Realized Gains
            ├─► Total Realized Losses
            ├─► Net Taxable Gain
            └─► Estimated Tax Due = Net × 0.33
    │
    ▼
Return JSON Response
    │
    ▼
Frontend: Display Results
```

## Key Design Decisions

1. **FIFO Accounting**: Chosen for simplicity and accuracy. Matches oldest purchases with sales first.

2. **No Database**: MVP uses in-memory calculations only. No persistence needed for MVP.

3. **Rate Limiting**: Conservative delays (7 seconds) to avoid hitting CoinGecko limits. Could be optimized with caching.

4. **Error Handling**: Graceful degradation - skips transactions without price data rather than failing entirely.

5. **Desktop-First UI**: Simple, clean design optimized for desktop screens. Responsive but not mobile-optimized.

6. **TypeScript**: Full type safety across frontend and backend for correctness.

## Testing Considerations

To test the PnL calculator:

1. **Simple Case**: 
   - Buy 100 tokens at $1.00
   - Sell 50 tokens at $1.50
   - Expected: Realized gain = $25 (50 × ($1.50 - $1.00))

2. **FIFO Case**:
   - Buy 100 tokens at $1.00
   - Buy 50 tokens at $1.10
   - Sell 75 tokens at $1.20
   - Expected: Cost basis = $75 (from first lot), Sale = $90, Gain = $15

3. **Loss Case**:
   - Buy 100 tokens at $2.00
   - Sell 50 tokens at $1.50
   - Expected: Realized loss = $25 (50 × ($1.50 - $2.00))

## Known Limitations & Workarounds

1. **Rate Limiting**: Large wallets may take several minutes. Consider showing progress indicator.

2. **Missing Prices**: Some tokens may not have historical price data on CoinGecko. These transactions are skipped.

3. **Transaction Type Detection**: Simple heuristic (incoming/outgoing) may not catch all DEX swaps correctly. Could be improved with DEX-specific APIs.

4. **Gas Fees**: Not accounted for in MVP. Could be added by fetching native ETH transfers.

5. **Multi-Token Swaps**: Complex DEX swaps involving multiple tokens may not be fully captured. MVP focuses on simple transfers.

## Next Steps for Production

1. **Caching**: Implement Redis or similar for price data to reduce API calls
2. **Progress Updates**: WebSocket or Server-Sent Events for long-running calculations
3. **Transaction Export**: CSV export of PnL breakdown
4. **More Chains**: Add Polygon, BSC, Arbitrum support
5. **Gas Fee Accounting**: Include gas costs in cost basis
6. **DEX Integration**: Better detection of swap transactions using DEX APIs

