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
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

    // Validate chain
    const supportedChains = ['ethereum', 'bsc', 'solana'];
    if (!supportedChains.includes(chain)) {
      return res.status(400).json({ 
        error: `Unsupported chain. Supported chains: ${supportedChains.join(', ')}` 
      });
    }

    // Validate address format based on chain
    let isValidAddress = false;
    switch (chain) {
      case 'ethereum':
      case 'bsc':
        isValidAddress = /^0x[a-fA-F0-9]{40}$/i.test(walletAddress);
        if (!isValidAddress) {
          return res.status(400).json({ 
            error: `Invalid ${chain === 'bsc' ? 'BSC' : 'Ethereum'} address format (should be 0x followed by 40 hex characters)` 
          });
        }
        break;
      case 'solana':
        isValidAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress);
        if (!isValidAddress) {
          return res.status(400).json({ 
            error: 'Invalid Solana address format (should be 32-44 base58 characters)' 
          });
        }
        break;
    }

    // Step 1: Fetch transactions based on chain
    console.log(`Fetching transactions for ${walletAddress} on ${chain}...`);
    let transactions;
    
    if (chain === 'ethereum') {
      transactions = await fetchTransactions(walletAddress);
    } else if (chain === 'bsc') {
      // TODO: Implement BSC transaction fetching
      return res.status(501).json({ 
        error: 'BSC support is coming soon. Please use Ethereum for now.' 
      });
    } else if (chain === 'solana') {
      // TODO: Implement Solana transaction fetching
      return res.status(501).json({ 
        error: 'Solana support is coming soon. Please use Ethereum for now.' 
      });
    } else {
      return res.status(400).json({ error: 'Unsupported chain' });
    }

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
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    // Provide helpful message for API key errors
    if (errorMessage.includes('API key') || errorMessage.includes('NOTOK')) {
      return res.status(400).json({
        success: false,
        error: errorMessage,
        hint: 'Please set a valid Etherscan API key in backend/.env.local. Get a free key from https://etherscan.io/apis',
      });
    }
    
    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}

