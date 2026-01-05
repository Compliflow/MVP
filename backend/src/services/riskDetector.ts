/**
 * Risk Detection Service
 * 
 * Detects compliance risks in wallet transactions:
 * - Known scam/rug contracts
 * - Blacklisted or sanctioned addresses
 * - High-risk protocol interactions
 * 
 * Uses public datasets and neutral tagging (not opinionated).
 * All risk flags are informational only.
 */

import { Transaction, RiskFlag, RiskLevel, WalletRiskAssessment } from '../../../shared/types';
import { WalletRiskAssessment as ComplianceWalletRiskAssessment } from '../../../shared/compliance-types';

// Known scam/rug contract addresses (example - in production, use a maintained dataset)
// These are example addresses for demonstration. Replace with actual public datasets.
const KNOWN_SCAM_CONTRACTS = new Set<string>([
  // Example: Add known scam contract addresses here
  // In production, this would be loaded from a maintained public dataset
]);

// Blacklisted/sanctioned addresses (example - use OFAC or similar public datasets)
const BLACKLISTED_ADDRESSES = new Set<string>([
  // Example: Add blacklisted addresses here
  // In production, use OFAC SDN list or similar public compliance datasets
]);

// High-risk protocol tags (protocols known for higher risk, not accusations)
// Tag-based system for protocol risk assessment
const HIGH_RISK_PROTOCOLS = new Set<string>([
  // Example protocol addresses that are known to be high-risk
  // This is tag-based, not opinionated - just informational
]);

/**
 * Check if a contract address is flagged as a known scam
 * 
 * @param contractAddress - Contract address to check
 * @returns Risk flag if detected, null otherwise
 */
function detectScamContract(contractAddress: string): RiskFlag | null {
  const normalizedAddress = contractAddress.toLowerCase();
  
  if (KNOWN_SCAM_CONTRACTS.has(normalizedAddress)) {
    return {
      type: 'scam_contract',
      description: 'Interaction with a contract flagged in public scam databases',
      source: 'public_dataset',
      confidence: 'high',
    };
  }
  
  return null;
}

/**
 * Check if an address is blacklisted or sanctioned
 * 
 * @param address - Address to check
 * @returns Risk flag if detected, null otherwise
 */
function detectBlacklistedAddress(address: string): RiskFlag | null {
  const normalizedAddress = address.toLowerCase();
  
  if (BLACKLISTED_ADDRESSES.has(normalizedAddress)) {
    return {
      type: 'blacklisted_address',
      description: 'Interaction with an address flagged in compliance databases',
      source: 'public_dataset',
      confidence: 'high',
    };
  }
  
  return null;
}

/**
 * Check if a protocol is tagged as high-risk
 * 
 * @param contractAddress - Protocol contract address
 * @returns Risk flag if detected, null otherwise
 */
function detectHighRiskProtocol(contractAddress: string): RiskFlag | null {
  const normalizedAddress = contractAddress.toLowerCase();
  
  if (HIGH_RISK_PROTOCOLS.has(normalizedAddress)) {
    return {
      type: 'high_risk_protocol',
      description: 'Interaction with a protocol tagged as high-risk',
      source: 'public_dataset',
      confidence: 'medium',
    };
  }
  
  return null;
}

/**
 * Analyze a single transaction for compliance risks
 * 
 * @param transaction - Transaction to analyze
 * @returns Array of risk flags (empty if no risks detected)
 */
export function analyzeTransactionRisks(transaction: Transaction): RiskFlag[] {
  const riskFlags: RiskFlag[] = [];
  
  // Check token contract (to address in token transfers)
  const tokenContractFlag = detectScamContract(transaction.tokenAddress);
  if (tokenContractFlag) {
    riskFlags.push(tokenContractFlag);
  }
  
  // Check from address
  const fromAddressFlag = detectBlacklistedAddress(transaction.from);
  if (fromAddressFlag) {
    riskFlags.push(fromAddressFlag);
  }
  
  // Check to address
  const toAddressFlag = detectBlacklistedAddress(transaction.to);
  if (toAddressFlag) {
    riskFlags.push(toAddressFlag);
  }
  
  // Check protocol risk (using token address as proxy for protocol)
  const protocolFlag = detectHighRiskProtocol(transaction.tokenAddress);
  if (protocolFlag) {
    riskFlags.push(protocolFlag);
  }
  
  return riskFlags;
}

/**
 * Assess overall wallet risk based on all transactions
 * 
 * @param transactions - All transactions for the wallet
 * @returns Wallet risk assessment
 */
export function assessWalletRisk(transactions: Transaction[]): WalletRiskAssessment {
  const allRiskFlags: RiskFlag[] = [];
  const flaggedContracts = new Set<string>();
  const flaggedAddresses = new Set<string>();
  
  // Analyze each transaction
  for (const tx of transactions) {
    const flags = analyzeTransactionRisks(tx);
    
    if (flags.length > 0) {
      allRiskFlags.push(...flags);
      
      // Track unique flagged contracts and addresses
      for (const flag of flags) {
        if (flag.type === 'scam_contract' || flag.type === 'high_risk_protocol') {
          flaggedContracts.add(tx.tokenAddress.toLowerCase());
        }
        if (flag.type === 'blacklisted_address') {
          if (tx.from.toLowerCase() !== tx.to.toLowerCase()) {
            flaggedAddresses.add(tx.from.toLowerCase());
            flaggedAddresses.add(tx.to.toLowerCase());
          }
        }
      }
    }
  }
  
  // Calculate risk metrics
  const totalRiskyInteractions = transactions.filter(tx => {
    const flags = analyzeTransactionRisks(tx);
    return flags.length > 0;
  }).length;
  
  const riskyInteractionPercentage = transactions.length > 0
    ? (totalRiskyInteractions / transactions.length) * 100
    : 0;
  
  // Determine overall risk level (neutral assessment)
  let overallRisk: RiskLevel = 'low';
  if (riskyInteractionPercentage > 20) {
    overallRisk = 'high';
  } else if (riskyInteractionPercentage > 5) {
    overallRisk = 'medium';
  }
  
  return {
    overallRisk,
    totalRiskyInteractions,
    riskyInteractionPercentage: Math.round(riskyInteractionPercentage * 100) / 100,
    riskFlags: allRiskFlags,
    flaggedContracts: Array.from(flaggedContracts),
    flaggedAddresses: Array.from(flaggedAddresses),
  };
}

