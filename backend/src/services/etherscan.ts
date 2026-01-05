/**
 * Etherscan API Service (V2)
 * 
 * Fetches ERC-20 token transfer transactions for a given wallet address.
 * Uses Etherscan's free API V2 (rate limit: 3 calls/second for free tier).
 */

import { Transaction } from '../../../shared/types';

const ETHERSCAN_API_URL = 'https://api.etherscan.io/v2/api';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken'; // Get free key from etherscan.io
const ETHEREUM_CHAIN_ID = 1; // Ethereum mainnet chain ID

// Check if API key is still the placeholder
if (ETHERSCAN_API_KEY === 'YourApiKeyToken' || !ETHERSCAN_API_KEY || ETHERSCAN_API_KEY.trim() === '') {
  console.warn('⚠️  WARNING: Etherscan API key is not set. Please add your API key to backend/.env.local');
  console.warn('   Get a free API key from: https://etherscan.io/apis');
}

/**
 * Fetch all ERC-20 token transfers for a wallet address
 * 
 * @param address - Ethereum wallet address
 * @returns Array of transactions
 */
export async function fetchTransactions(address: string): Promise<Transaction[]> {
  // V2 API format: chainid parameter is required
  const url = `${ETHERSCAN_API_URL}?chainid=${ETHEREUM_CHAIN_ID}&module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${ETHERSCAN_API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Etherscan API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // V2 API response format may differ, handle both success and error cases
    if (data.status === '0' && data.message !== 'No transactions found') {
      // Check for common API key errors
      if (data.message === 'NOTOK' && (data.result === 'Invalid API Key' || data.result?.includes('Invalid API Key') || data.result?.includes('api key'))) {
        throw new Error('Invalid Etherscan API key. Please set a valid API key in backend/.env.local file. Get a free key from https://etherscan.io/apis');
      }
      // Generic NOTOK error
      if (data.message === 'NOTOK') {
        throw new Error(`Etherscan API error: ${data.result || data.message}`);
      }
      throw new Error(`Etherscan API error: ${data.message}`);
    }

    if (!data.result || data.result.length === 0) {
      return [];
    }

    // Transform Etherscan response to our Transaction format
    const transactions: Transaction[] = data.result.map((tx: any) => {
      // Determine transaction type
      // For MVP: if 'to' matches wallet address, it's a buy/incoming
      // If 'from' matches wallet address, it's a sell/outgoing
      const walletAddressLower = address.toLowerCase();
      const isIncoming = tx.to.toLowerCase() === walletAddressLower;
      const isOutgoing = tx.from.toLowerCase() === walletAddressLower;
      
      let type: 'buy' | 'sell' | 'swap';
      if (isIncoming && !isOutgoing) {
        type = 'buy';
      } else if (isOutgoing && !isIncoming) {
        type = 'sell';
      } else {
        type = 'swap'; // Both addresses match (self-transfer or DEX swap)
      }

      // Convert amount from wei/smallest unit to decimal
      // ERC-20 tokens have different decimal places (usually 18)
      const decimals = parseInt(tx.tokenDecimal || '18', 10);
      const amountDecimal = parseFloat(tx.value) / Math.pow(10, decimals);

      return {
        hash: tx.hash,
        timestamp: parseInt(tx.timeStamp, 10),
        from: tx.from,
        to: tx.to,
        tokenAddress: tx.contractAddress,
        tokenSymbol: tx.tokenSymbol || 'UNKNOWN',
        amount: tx.value, // Keep raw amount as string
        amountDecimal,
        type,
      };
    });

    return transactions;
  } catch (error) {
    console.error('Error fetching transactions from Etherscan:', error);
    throw error;
  }
}

/**
 * Rate limit helper: wait between API calls
 * Etherscan free tier: 5 calls/second = 200ms between calls
 */
export function delay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

