/**
 * Frontend TypeScript types
 */

export interface TaxCalculationResult {
  totalRealizedGains: number;
  totalRealizedLosses: number;
  netTaxableGain: number;
  estimatedTaxDue: number;
  taxRate: number;
  transactionCount: number;
  pnlBreakdown: PnLResult[];
}

export interface PnLResult {
  transactionHash: string;
  tokenAddress: string;
  tokenSymbol: string;
  amount: number;
  costBasisUSD: number;
  salePriceUSD: number;
  realizedGainUSD: number;
  timestamp: number;
}

export interface ApiResponse {
  success: boolean;
  data?: TaxCalculationResult;
  error?: string;
  warning?: string;
}

