/**
 * API Route: Calculate Tax
 * 
 * Endpoint: POST /api/calculate-tax
 * 
 * Request body:
 * {
 *   walletAddress: string,
 *   chain: 'ethereum' (for MVP)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   data?: TaxCalculationResult,
 *   error?: string
 * }
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { fetchTransactions } from '../../src/services/etherscan';
import { fetchPricesForTransactions } from '../../src/services/coingecko';
import { calculatePnL } from '../../src/services/pnlCalculator';
import { TaxCalculationResult } from '../../shared/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress, chain } = req.body;

    // Validate input
    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    if (chain !== 'ethereum') {
      return res.status(400).json({ 
        error: 'Only Ethereum is supported in MVP' 
      });
    }

    // Validate Ethereum address format (basic check)
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ error: 'Invalid Ethereum address format' });
    }

    // Step 1: Fetch transactions from Etherscan
    console.log(`Fetching transactions for ${walletAddress}...`);
    const transactions = await fetchTransactions(walletAddress);

    if (transactions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalRealizedGains: 0,
          totalRealizedLosses: 0,
          netTaxableGain: 0,
          estimatedTaxDue: 0,
          taxRate: 0.33,
          transactionCount: 0,
          pnlBreakdown: [],
        } as TaxCalculationResult,
      });
    }

    // Step 2: Fetch historical prices for all transactions
    console.log(`Fetching historical prices for ${transactions.length} transactions...`);
    const transactionsWithPrices = await fetchPricesForTransactions(transactions);

    // Filter out transactions without price data
    const validTransactions = transactionsWithPrices.filter(
      (tx) => tx.priceUSD !== undefined && tx.priceUSD > 0
    );

    if (validTransactions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalRealizedGains: 0,
          totalRealizedLosses: 0,
          netTaxableGain: 0,
          estimatedTaxDue: 0,
          taxRate: 0.33,
          transactionCount: transactions.length,
          pnlBreakdown: [],
        } as TaxCalculationResult,
        warning: 'No transactions with valid price data found',
      });
    }

    // Step 3: Calculate PnL using FIFO
    console.log(`Calculating PnL for ${validTransactions.length} transactions...`);
    const taxResult = calculatePnL(validTransactions, 0.33);

    // Step 4: Return result
    return res.status(200).json({
      success: true,
      data: taxResult,
    });
  } catch (error) {
    console.error('Error calculating tax:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

