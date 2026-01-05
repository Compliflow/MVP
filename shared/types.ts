/**
 * Shared TypeScript types for crypto tax calculation
 */

/**
 * Transaction Classification Types
 * Used for categorizing transactions for compliance purposes
 */
export type TransactionClassification = 
  | 'trade'        // Buy/sell/swap
  | 'transfer'     // Self-transfer or external transfer
  | 'income'       // Airdrop, rewards, staking
  | 'nft'          // NFT mint/sale/transfer
  | 'bridge'       // Cross-chain bridge transaction
  | 'gas'          // Gas/fee payment
  | 'unclassified'; // Unable to classify automatically

/**
 * Risk Level Indicators
 * Neutral compliance risk assessment
 */
export type RiskLevel = 'low' | 'medium' | 'high';

/**
 * Risk Flag Types
 * Categories of compliance risks detected
 */
export type RiskFlagType = 
  | 'scam_contract'      // Known scam or rug pull contract
  | 'blacklisted_address' // Sanctioned or blacklisted address
  | 'high_risk_protocol'; // High-risk protocol interaction

export interface RiskFlag {
  type: RiskFlagType;
  description: string; // Neutral description of the risk
  source: string; // Data source (e.g., "public_dataset", "community_reports")
  confidence: 'high' | 'medium' | 'low'; // Confidence in the flag
}

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
  
  // Compliance extensions (optional, added by compliance services)
  classification?: TransactionClassification;
  riskFlags?: RiskFlag[];
  isSelfTransfer?: boolean; // true if from and to are the same wallet
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

