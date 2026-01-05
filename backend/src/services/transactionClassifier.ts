/**
 * Transaction Classification Service
 * 
 * Classifies transactions into categories for compliance purposes:
 * - Trade (buy/sell/swap)
 * - Transfer (self vs external)
 * - Income (airdrop, rewards, staking)
 * - NFT-related (mint/sale)
 * - Bridge transactions
 * - Gas/fees
 * 
 * Designed to allow manual override later (data model supports it).
 */

import { Transaction, TransactionClassification } from '../../../shared/types';
import { ClassificationSummary } from '../../../shared/compliance-types';

/**
 * Classify a single transaction based on its characteristics
 * 
 * @param transaction - Transaction to classify
 * @param allTransactions - All transactions for context (for pattern detection)
 * @returns Classification and confidence
 */
export function classifyTransaction(
  transaction: Transaction,
  allTransactions: Transaction[] = []
): TransactionClassification {
  // Check if it's a self-transfer
  const isSelfTransfer = transaction.from.toLowerCase() === transaction.to.toLowerCase();
  
  if (isSelfTransfer) {
    return 'transfer';
  }
  
  // Check if it matches existing trade types
  if (transaction.type === 'buy' || transaction.type === 'sell' || transaction.type === 'swap') {
    return 'trade';
  }
  
  // Check for zero-amount transactions (likely gas/fees or approvals)
  if (transaction.amountDecimal === 0 || parseFloat(transaction.amount) === 0) {
    return 'gas';
  }
  
  // Check for common income patterns
  // Income transactions often have:
  // - Token received from a known staking/rewards contract
  // - No corresponding outgoing transaction
  // - Common reward token addresses (this would be enhanced with actual data)
  const isLikelyIncome = checkIfIncomeTransaction(transaction, allTransactions);
  if (isLikelyIncome) {
    return 'income';
  }
  
  // Check for NFT patterns
  // NFT transactions often involve:
  // - Specific NFT contract addresses (ERC-721/ERC-1155)
  // - Amount of 1 or specific NFT amounts
  const isLikelyNFT = checkIfNFTTransaction(transaction);
  if (isLikelyNFT) {
    return 'nft';
  }
  
  // Check for bridge patterns
  // Bridge transactions often involve:
  // - Known bridge contract addresses
  // - Wrapped token patterns
  const isLikelyBridge = checkIfBridgeTransaction(transaction);
  if (isLikelyBridge) {
    return 'bridge';
  }
  
  // Default to unclassified if we can't determine
  return 'unclassified';
}

/**
 * Check if transaction appears to be income (airdrop, rewards, staking)
 * 
 * @param transaction - Transaction to check
 * @param allTransactions - All transactions for pattern analysis
 * @returns true if likely income
 */
function checkIfIncomeTransaction(
  transaction: Transaction,
  allTransactions: Transaction[]
): boolean {
  // Simple heuristic: if token is received (to is wallet) and there's no corresponding
  // outgoing transaction for that token, it might be income
  // This is a simplified check - in production, use known reward/staking contract addresses
  
  // Check if this is an incoming transaction (token received)
  // In token transfers, if 'to' matches the wallet being analyzed, it's incoming
  // For now, we'll use a simple pattern: small amounts from unknown contracts might be airdrops
  
  // This is a placeholder - in production, integrate with known staking/rewards contracts
  return false;
}

/**
 * Check if transaction appears to be NFT-related
 * 
 * @param transaction - Transaction to check
 * @returns true if likely NFT
 */
function checkIfNFTTransaction(transaction: Transaction): boolean {
  // NFT contracts are typically ERC-721 or ERC-1155
  // Common patterns:
  // - Amount is often 1 (for ERC-721) or specific NFT amounts (for ERC-1155)
  // - Contract addresses might be known NFT collections
  
  // Check if amount is 1 (common for ERC-721 NFTs)
  if (transaction.amountDecimal === 1) {
    // Could be NFT, but could also be regular token
    // In production, check contract type (ERC-721/ERC-1155)
    return false; // Conservative: don't classify as NFT without more data
  }
  
  // Placeholder: in production, check contract type or known NFT collections
  return false;
}

/**
 * Check if transaction appears to be a bridge transaction
 * 
 * @param transaction - Transaction to check
 * @returns true if likely bridge
 */
function checkIfBridgeTransaction(transaction: Transaction): boolean {
  // Bridge transactions often involve:
  // - Known bridge contract addresses (e.g., Polygon Bridge, Arbitrum Bridge)
  // - Wrapped tokens (WETH, WBTC, etc.)
  // - Cross-chain token patterns
  
  // Check for wrapped tokens (common in bridges)
  const wrappedTokens = ['weth', 'wbtc', 'wmatic', 'wbnb'];
  const tokenSymbolLower = transaction.tokenSymbol.toLowerCase();
  
  if (wrappedTokens.some(wrapped => tokenSymbolLower.includes(wrapped))) {
    // Could be bridge-related, but also could be regular wrapped token usage
    // In production, check if interacting with known bridge contracts
    return false; // Conservative
  }
  
  // Placeholder: in production, check known bridge contract addresses
  return false;
}

/**
 * Classify all transactions and generate summary
 * 
 * @param transactions - All transactions to classify
 * @returns Classification summary
 */
export function classifyAllTransactions(transactions: Transaction[]): ClassificationSummary {
  const classificationBreakdown: Record<TransactionClassification, number> = {
    trade: 0,
    transfer: 0,
    income: 0,
    nft: 0,
    bridge: 0,
    gas: 0,
    unclassified: 0,
  };
  
  let classifiedCount = 0;
  
  // Classify each transaction
  for (const tx of transactions) {
    const classification = classifyTransaction(tx, transactions);
    classificationBreakdown[classification]++;
    
    // Mark transaction with classification
    tx.classification = classification;
    
    // Check if self-transfer
    tx.isSelfTransfer = tx.from.toLowerCase() === tx.to.toLowerCase();
    
    if (classification !== 'unclassified') {
      classifiedCount++;
    }
  }
  
  const totalTransactions = transactions.length;
  const unclassifiedCount = totalTransactions - classifiedCount;
  const classificationConfidence = totalTransactions > 0
    ? classifiedCount / totalTransactions
    : 0;
  
  return {
    totalTransactions,
    classifiedCount,
    unclassifiedCount,
    classificationBreakdown,
    classificationConfidence: Math.round(classificationConfidence * 1000) / 1000, // Round to 3 decimals
  };
}

