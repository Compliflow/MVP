/**
 * Shared TypeScript types for crypto tax calculation
 */

export interface Transaction {
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  tokenAddress: string;
  tokenSymbol: string;
  amount: string; // Raw amount as string (wei/smallest unit)
  amountDecimal: number; // Human-readable decimal amount
  type: 'buy' | 'sell' | 'swap';
  priceUSD?: number; // Historical price at transaction time
}

export interface TokenHolding {
  tokenAddress: string;
  amount: number; // Amount remaining in this lot
  costBasisUSD: number; // Total cost basis for this lot
  purchaseTimestamp: number;
  pricePerTokenUSD: number; // Cost basis per token
}

export interface PnLResult {
  transactionHash: string;
  tokenAddress: string;
  tokenSymbol: string;
  amount: number;
  costBasisUSD: number;
  salePriceUSD: number;
  realizedGainUSD: number; // Positive for gain, negative for loss
  timestamp: number;
}

export interface TaxCalculationResult {
  totalRealizedGains: number;
  totalRealizedLosses: number; // Absolute value of losses
  netTaxableGain: number;
  estimatedTaxDue: number;
  taxRate: number;
  transactionCount: number;
  pnlBreakdown: PnLResult[];
}

export type TokenInventory = Map<string, TokenHolding[]>;

