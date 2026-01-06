/**
 * Solana RPC Service
 * 
 * Fetches token transfer transactions for a given Solana wallet address.
 * Uses Solana RPC API (public endpoints available).
 */

import { Transaction } from '../../../shared/types';

// Public Solana RPC endpoints (free tier)
// Note: Public endpoints are rate-limited. For production, use a paid RPC provider.
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

/**
 * Retry helper with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = error?.message?.includes('Too Many Requests') || 
                         error?.message?.includes('429') ||
                         error?.message?.includes('rate limit');
      
      if (isRateLimit && attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`Rate limited, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Fetch all token transfers for a Solana wallet address
 * 
 * @param address - Solana wallet address
 * @returns Array of transactions
 */
export async function fetchSolanaTransactions(address: string): Promise<Transaction[]> {
  try {
    // Solana RPC call to get signatures for account (with retry logic)
    const getSignatures = async () => {
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
              limit: 100, // Reduced limit to avoid rate limits
            },
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too Many Requests - Solana RPC is rate-limited. Please try again in a moment or use a dedicated RPC provider.');
        }
        throw new Error(`Solana RPC error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        if (data.error.code === 429 || data.error.message?.includes('rate limit') || data.error.message?.includes('Too Many Requests')) {
          throw new Error('Too Many Requests - Solana RPC is rate-limited. Please try again in a moment or use a dedicated RPC provider.');
        }
        throw new Error(`Solana RPC error: ${data.error.message || 'Unknown error'}`);
      }
      
      return data;
    };

    const data = await retryWithBackoff(getSignatures, 3, 2000);

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
          const getTransaction = async () => {
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

            if (!txResponse.ok) {
              if (txResponse.status === 429) {
                throw new Error('Rate limited');
              }
              throw new Error(`HTTP ${txResponse.status}`);
            }

            const txData = await txResponse.json();
            
            if (txData.error) {
              if (txData.error.code === 429) {
                throw new Error('Rate limited');
              }
              return null;
            }
            
            if (!txData.result) {
              return null;
            }
            
            return txData;
          };

          const txData = await retryWithBackoff(getTransaction, 2, 1000).catch(() => null);
          
          if (!txData) {
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
      
      // Rate limiting: wait between batches (increased delay for public RPC)
      if (i + batchSize < signatures.length) {
        await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms between batches
      }
    }

    // Sort by timestamp
    transactions.sort((a, b) => a.timestamp - b.timestamp);

    return transactions;
  } catch (error) {
    console.error('Error fetching Solana transactions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Provide helpful error message for rate limits
    if (errorMessage.includes('Too Many Requests') || errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      throw new Error('Solana RPC rate limit exceeded. The public RPC endpoint has strict rate limits. Please try again in a few minutes, or consider using a dedicated RPC provider (Helius, QuickNode, Alchemy) for better performance.');
    }
    
    throw error;
  }
}

