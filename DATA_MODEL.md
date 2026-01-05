# Data Model Design

## Core Types

### Transaction
Represents a single on-chain transaction involving token transfers.

```typescript
interface Transaction {
  hash: string;              // Transaction hash
  timestamp: number;         // Unix timestamp
  from: string;             // Sender address
  to: string;               // Recipient address
  tokenAddress: string;     // ERC-20 token contract address
  tokenSymbol: string;       // Token symbol (e.g., "USDC", "WETH")
  amount: string;           // Token amount (in token's smallest unit, as string for precision)
  amountDecimal: number;    // Amount in human-readable decimal format
  type: 'buy' | 'sell' | 'swap';  // Transaction type
  priceUSD?: number;        // Token price in USD at transaction time (fetched from CoinGecko)
}
```

### TokenHolding
Represents a lot of tokens held in inventory (FIFO queue).

```typescript
interface TokenHolding {
  tokenAddress: string;     // Token contract address
  amount: number;           // Amount of tokens in this lot
  costBasisUSD: number;     // Total cost basis in USD for this lot
  purchaseTimestamp: number; // When this lot was acquired
  pricePerTokenUSD: number; // Cost basis per token
}
```

### PnLResult
Result of a single realized gain/loss calculation.

```typescript
interface PnLResult {
  transactionHash: string;  // Associated transaction
  tokenAddress: string;
  tokenSymbol: string;
  amount: number;           // Amount sold
  costBasisUSD: number;     // Cost basis of sold tokens
  salePriceUSD: number;     // Sale price in USD
  realizedGainUSD: number;  // Gain (positive) or loss (negative)
  timestamp: number;
}
```

### TaxCalculationResult
Final aggregated tax calculation result.

```typescript
interface TaxCalculationResult {
  totalRealizedGains: number;    // Sum of all gains
  totalRealizedLosses: number;   // Sum of all losses (absolute value)
  netTaxableGain: number;        // Gains - Losses
  estimatedTaxDue: number;       // Net taxable gain * 0.33
  taxRate: number;               // 0.33 (33%)
  transactionCount: number;      // Total transactions processed
  pnlBreakdown: PnLResult[];     // Detailed breakdown per transaction
}
```

## FIFO Queue Structure

For each token, maintain a queue of holdings:

```typescript
// Map: tokenAddress -> Array of TokenHolding (oldest first)
type TokenInventory = Map<string, TokenHolding[]>;
```

### FIFO Operations

1. **Add Holding (on buy/swap-in)**:
   - Create new `TokenHolding` with purchase price
   - Push to end of token's queue

2. **Remove Holding (on sell/swap-out)**:
   - Pop from front of token's queue (oldest first)
   - Calculate realized PnL: `(sale_price - cost_basis) * amount`
   - If lot is partially consumed, update remaining amount

## Example Flow

### Transaction 1: Buy 100 USDC at $1.00
- Add to inventory: `{amount: 100, costBasisUSD: 100, pricePerTokenUSD: 1.00}`

### Transaction 2: Buy 50 USDC at $1.10
- Add to inventory: `{amount: 50, costBasisUSD: 55, pricePerTokenUSD: 1.10}`

### Transaction 3: Sell 75 USDC at $1.20
- Remove from inventory (FIFO):
  - Take 75 from first lot (100 available)
  - Cost basis: 75 * $1.00 = $75
  - Sale value: 75 * $1.20 = $90
  - Realized gain: $90 - $75 = $15
- Update inventory: First lot now has 25 USDC remaining

## Edge Cases

1. **Partial Lot Consumption**: When selling less than a full lot, update the lot's amount
2. **Insufficient Holdings**: If selling more than available, this indicates an error (shouldn't happen with correct data)
3. **Zero Price**: Handle cases where CoinGecko doesn't have historical price (skip or use fallback)
4. **Token Decimals**: Ensure proper decimal handling (ERC-20 tokens have different decimal places)

