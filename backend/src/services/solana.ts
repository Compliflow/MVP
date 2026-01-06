/**
 * Solana RPC Service
 * 
 * Fetches token transfer transactions for a given Solana wallet address.
 * Uses Solana RPC API (public endpoints available).
 */

import { Transaction } from '../../../shared/types';

// Public Solana RPC endpoints (free tier)
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

/**
 * Fetch all token transfers for a Solana wallet address
 * 
 * @param address - Solana wallet address
 * @returns Array of transactions
 */
export async function fetchSolanaTransactions(address: string): Promise<Transaction[]> {
  try {
    // Solana RPC call to get signatures for account
    const response = await fetch(SOLANA_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getSignaturesForAddress',
        params: [
          address,
          {
            limit: 1000, // Limit to 1000 most recent transactions
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Solana RPC error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`Solana RPC error: ${data.error.message || 'Unknown error'}`);
    }

    if (!data.result || data.result.length === 0) {
      return [];
    }

    // Get transaction details for each signature
    const signatures = data.result.map((sig: any) => sig.signature);
    const transactions: Transaction[] = [];

    // Fetch transaction details in batches (Solana RPC has limits)
    const batchSize = 10;
    for (let i = 0; i < signatures.length; i += batchSize) {
      const batch = signatures.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (signature: string) => {
        try {
          const txResponse = await fetch(SOLANA_RPC_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'getTransaction',
              params: [
                signature,
                {
                  encoding: 'jsonParsed',
                  maxSupportedTransactionVersion: 0,
                },
              ],
            }),
          });

          const txData = await txResponse.json();
          
          if (txData.error || !txData.result) {
            return null;
          }

          const tx = txData.result;
          const blockTime = tx.blockTime || Math.floor(Date.now() / 1000);

          // Parse token transfers from transaction
          // Solana transactions can have multiple token transfers
          if (tx.transaction && tx.transaction.message && tx.transaction.message.instructions) {
            for (const instruction of tx.transaction.message.instructions) {
              // Check if it's a token transfer instruction
              if (instruction.parsed && instruction.parsed.type === 'transfer') {
                const transfer = instruction.parsed.info;
                
                transactions.push({
                  hash: signature,
                  timestamp: blockTime,
                  from: transfer.authority || transfer.source || address,
                  to: transfer.destination || address,
                  tokenAddress: transfer.mint || 'native', // Native SOL if no mint
                  tokenSymbol: transfer.mint ? 'SPL' : 'SOL', // Simplified - would need to fetch token metadata
                  amount: transfer.amount || '0',
                  amountDecimal: parseFloat(transfer.amount || '0') / 1e9, // Convert from lamports (9 decimals)
                  type: transfer.source === address ? 'sell' : 'buy', // Simplified classification
                });
              }
            }
          }

          return null;
        } catch (error) {
          console.warn(`Error fetching transaction ${signature}:`, error);
          return null;
        }
      });

      await Promise.all(batchPromises);
      
      // Rate limiting: wait between batches
      if (i + batchSize < signatures.length) {
        await new Promise((resolve) => setTimeout(resolve, 200)); // 200ms between batches
      }
    }

    // Sort by timestamp
    transactions.sort((a, b) => a.timestamp - b.timestamp);

    return transactions;
  } catch (error) {
    console.error('Error fetching Solana transactions:', error);
    throw error;
  }
}

