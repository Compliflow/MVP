/**
 * Compliance-specific TypeScript types
 * 
 * Extends the base transaction model with compliance and risk assessment data
 */

import { RiskLevel, RiskFlag, TransactionClassification } from './types';

/**
 * Wallet Risk Assessment
 * Aggregated risk analysis for a wallet
 */
export interface WalletRiskAssessment {
  overallRisk: RiskLevel;
  totalRiskyInteractions: number;
  riskyInteractionPercentage: number; // % of transactions with risk flags
  riskFlags: RiskFlag[];
  flaggedContracts: string[]; // Unique contract addresses with flags
  flaggedAddresses: string[]; // Unique addresses with flags
}

/**
 * Trade Statistics
 * Statistics about profitable and loss-making trades
 */
export interface TradeStatistics {
  totalTrades: number;
  profitableTrades: number;
  lossTrades: number;
  breakEvenTrades: number;
  biggestWin: {
    amount: number;
    tokenSymbol: string;
    timestamp: number;
    transactionHash: string;
  } | null;
  biggestLoss: {
    amount: number;
    tokenSymbol: string;
    timestamp: number;
    transactionHash: string;
  } | null;
}

/**
 * Transaction Classification Summary
 * Summary of transaction classifications
 */
export interface ClassificationSummary {
  totalTransactions: number;
  classifiedCount: number;
  unclassifiedCount: number;
  classificationBreakdown: Record<TransactionClassification, number>;
  classificationConfidence: number; // 0-1, average confidence in classifications
  tradeStatistics?: TradeStatistics; // Trade statistics if available
}

/**
 * Compliance Summary
 * Overall compliance analysis for a wallet
 */
export interface ComplianceSummary {
  walletAddress: string;
  totalTransactions: number;
  riskAssessment: WalletRiskAssessment;
  classificationSummary: ClassificationSummary;
  complianceFlags: string[]; // High-level compliance concerns
  lastAnalyzed: number; // Timestamp
}

/**
 * Regulatory Awareness Information
 * Informational guidance based on wallet activity
 */
export interface RegulatoryAwareness {
  country: string;
  considerations: string[]; // List of regulatory considerations
  disclaimer: string; // Legal disclaimer
}

