/**
 * PnL Calculator - FIFO Accounting Logic
 * 
 * This module implements First-In-First-Out (FIFO) accounting for calculating
 * realized gains and losses on cryptocurrency transactions.
 * 
 * Ireland Tax Rules (Simplified):
 * - Capital Gains Tax: 33%
 * - No exemptions or allowances in MVP
 */

import {
  Transaction,
  TokenHolding,
  PnLResult,
  TaxCalculationResult,
  TokenInventory,
} from '../../../shared/types';

/**
 * Process transactions and calculate realized PnL using FIFO accounting
 * 
 * Algorithm:
 * 1. Sort transactions by timestamp (chronological order)
 * 2. For each transaction:
 *    - If BUY/SWAP-IN: Add tokens to inventory (FIFO queue)
 *    - If SELL/SWAP-OUT: Remove tokens from inventory (oldest first) and calculate PnL
 * 3. Aggregate all realized gains and losses
 * 4. Calculate tax due
 * 
 * @param transactions - Array of transactions with historical prices
 * @param taxRate - Tax rate (default 0.33 for Ireland)
 * @returns Tax calculation result with detailed breakdown
 */
export function calculatePnL(
  transactions: Transaction[],
  taxRate: number = 0.33
): TaxCalculationResult {
  // Sort transactions chronologically
  const sortedTransactions = [...transactions].sort(
    (a, b) => a.timestamp - b.timestamp
  );

  // FIFO inventory: tokenAddress -> queue of holdings (oldest first)
  const inventory: TokenInventory = new Map();

  // Track all realized PnL results
  const pnlBreakdown: PnLResult[] = [];

  // Process each transaction in chronological order
  for (const tx of sortedTransactions) {
    if (!tx.priceUSD || tx.priceUSD <= 0) {
      // Skip transactions without valid price data
      console.warn(`Skipping transaction ${tx.hash}: no valid price data`);
      continue;
    }

    if (tx.type === 'buy' || (tx.type === 'swap' && tx.to.toLowerCase() === tx.from.toLowerCase())) {
      // BUY or SWAP-IN: Add tokens to inventory
      addToInventory(inventory, tx);
    } else if (tx.type === 'sell' || (tx.type === 'swap' && tx.to.toLowerCase() !== tx.from.toLowerCase())) {
      // SELL or SWAP-OUT: Remove tokens from inventory and calculate PnL
      const pnl = removeFromInventory(inventory, tx);
      if (pnl) {
        pnlBreakdown.push(pnl);
      }
    }
  }

  // Aggregate gains and losses
  const totalRealizedGains = pnlBreakdown
    .filter((pnl) => pnl.realizedGainUSD > 0)
    .reduce((sum, pnl) => sum + pnl.realizedGainUSD, 0);

  const totalRealizedLosses = Math.abs(
    pnlBreakdown
      .filter((pnl) => pnl.realizedGainUSD < 0)
      .reduce((sum, pnl) => sum + pnl.realizedGainUSD, 0)
  );

  const netTaxableGain = totalRealizedGains - totalRealizedLosses;
  const estimatedTaxDue = Math.max(0, netTaxableGain * taxRate);

  return {
    totalRealizedGains,
    totalRealizedLosses,
    netTaxableGain,
    estimatedTaxDue,
    taxRate,
    transactionCount: sortedTransactions.length,
    pnlBreakdown,
  };
}

/**
 * Add tokens to inventory (FIFO queue)
 * 
 * @param inventory - The FIFO inventory map
 * @param tx - Buy or swap-in transaction
 */
function addToInventory(inventory: TokenInventory, tx: Transaction): void {
  if (!tx.priceUSD) return;

  const tokenAddress = tx.tokenAddress.toLowerCase();
  const amount = tx.amountDecimal;
  const costBasisUSD = amount * tx.priceUSD;

  // Get or create queue for this token
  if (!inventory.has(tokenAddress)) {
    inventory.set(tokenAddress, []);
  }

  const queue = inventory.get(tokenAddress)!;

  // Create new holding lot
  const holding: TokenHolding = {
    tokenAddress: tx.tokenAddress,
    amount,
    costBasisUSD,
    purchaseTimestamp: tx.timestamp,
    pricePerTokenUSD: tx.priceUSD,
  };

  // Add to end of queue (FIFO: oldest at front, newest at back)
  queue.push(holding);
}

/**
 * Remove tokens from inventory (FIFO: oldest first) and calculate realized PnL
 * 
 * @param inventory - The FIFO inventory map
 * @param tx - Sell or swap-out transaction
 * @returns PnL result if calculation successful, null otherwise
 */
function removeFromInventory(
  inventory: TokenInventory,
  tx: Transaction
): PnLResult | null {
  if (!tx.priceUSD) return null;

  const tokenAddress = tx.tokenAddress.toLowerCase();
  const saleAmount = tx.amountDecimal;
  const salePricePerToken = tx.priceUSD;
  const totalSaleValueUSD = saleAmount * salePricePerToken;

  // Get queue for this token
  const queue = inventory.get(tokenAddress);
  if (!queue || queue.length === 0) {
    // No holdings available - this might indicate an error in transaction data
    console.warn(
      `Cannot sell ${saleAmount} ${tx.tokenSymbol}: no holdings in inventory`
    );
    return null;
  }

  let remainingToSell = saleAmount;
  let totalCostBasisUSD = 0;

  // Remove tokens from inventory using FIFO (oldest first)
  while (remainingToSell > 0 && queue.length > 0) {
    const oldestHolding = queue[0];

    if (oldestHolding.amount <= remainingToSell) {
      // Consume entire lot
      totalCostBasisUSD += oldestHolding.costBasisUSD;
      remainingToSell -= oldestHolding.amount;
      queue.shift(); // Remove from front of queue
    } else {
      // Partially consume lot
      const fraction = remainingToSell / oldestHolding.amount;
      totalCostBasisUSD += oldestHolding.costBasisUSD * fraction;
      oldestHolding.amount -= remainingToSell;
      oldestHolding.costBasisUSD -= oldestHolding.costBasisUSD * fraction;
      remainingToSell = 0;
    }
  }

  if (remainingToSell > 0) {
    // Couldn't fulfill entire sale - error condition
    console.warn(
      `Insufficient holdings: tried to sell ${saleAmount} ${tx.tokenSymbol}, but only had ${saleAmount - remainingToSell} available`
    );
    return null;
  }

  // Calculate realized gain/loss
  const realizedGainUSD = totalSaleValueUSD - totalCostBasisUSD;

  return {
    transactionHash: tx.hash,
    tokenAddress: tx.tokenAddress,
    tokenSymbol: tx.tokenSymbol,
    amount: saleAmount,
    costBasisUSD: totalCostBasisUSD,
    salePriceUSD: totalSaleValueUSD,
    realizedGainUSD,
    timestamp: tx.timestamp,
  };
}

/**
 * Helper function to validate transaction data before processing
 */
export function validateTransaction(tx: Transaction): boolean {
  return (
    !!tx.hash &&
    !!tx.tokenAddress &&
    tx.amountDecimal > 0 &&
    !!tx.timestamp &&
    ['buy', 'sell', 'swap'].includes(tx.type)
  );
}

