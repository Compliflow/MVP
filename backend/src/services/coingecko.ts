/**
 * CoinGecko API Service
 * 
 * Fetches historical token prices at specific timestamps.
 * Uses CoinGecko's free API (rate limit: 10-50 calls/minute).
 * 
 * Note: CoinGecko uses coin IDs, not contract addresses.
 * We'll need a mapping or use their contract address endpoint.
 */

import { Transaction } from '../../../shared/types';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

/**
 * Get CoinGecko coin ID from Ethereum contract address
 * 
 * @param contractAddress - ERC-20 token contract address
 * @returns CoinGecko coin ID or null if not found
 */
async function getCoinIdFromAddress(contractAddress: string): Promise<string | null> {
  try {
    const url = `${COINGECKO_API_URL}/coins/ethereum/contract/${contractAddress.toLowerCase()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.id || null;
  } catch (error) {
    console.error(`Error fetching coin ID for ${contractAddress}:`, error);
    return null;
  }
}

/**
 * Fetch historical price for a token at a specific timestamp
 * 
 * @param contractAddress - ERC-20 token contract address
 * @param timestamp - Unix timestamp
 * @returns Price in USD at that timestamp, or null if not available
 */
export async function fetchHistoricalPrice(
  contractAddress: string,
  timestamp: number
): Promise<number | null> {
  try {
    // First, get the coin ID from contract address
    const coinId = await getCoinIdFromAddress(contractAddress);
    if (!coinId) {
      console.warn(`CoinGecko: No coin ID found for contract ${contractAddress}`);
      return null;
    }

    // Convert Unix timestamp to date string (YYYY-MM-DD)
    const date = new Date(timestamp * 1000);
    const dateStr = date.toISOString().split('T')[0];

    // Fetch historical price
    const url = `${COINGECKO_API_URL}/coins/${coinId}/history?date=${dateStr}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`CoinGecko: Failed to fetch price for ${coinId} at ${dateStr}`);
      return null;
    }

    const data = await response.json();
    const priceUSD = data.market_data?.current_price?.usd;

    if (typeof priceUSD === 'number' && priceUSD > 0) {
      return priceUSD;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching historical price for ${contractAddress}:`, error);
    return null;
  }
}

/**
 * Batch fetch historical prices for multiple transactions
 * Implements rate limiting to respect CoinGecko's API limits
 * 
 * @param transactions - Transactions needing price data
 * @returns Transactions with priceUSD populated
 */
export async function fetchPricesForTransactions(
  transactions: Transaction[]
): Promise<Transaction[]> {
  // Rate limit: 10 calls/minute = 6 seconds between calls
  // For MVP, we'll be conservative and use 7 seconds
  const RATE_LIMIT_MS = 7000;

  const transactionsWithPrices: Transaction[] = [];
  const uniqueTokens = new Set<string>();

  // First, identify unique tokens
  for (const tx of transactions) {
    uniqueTokens.add(tx.tokenAddress.toLowerCase());
  }

  // Create a map of token address -> price at timestamp
  // Group transactions by token and date to minimize API calls
  const priceCache = new Map<string, Map<number, number>>();

  for (const tokenAddress of uniqueTokens) {
    const tokenTransactions = transactions.filter(
      (tx) => tx.tokenAddress.toLowerCase() === tokenAddress
    );

    // Get unique dates for this token
    const dates = new Set<number>();
    for (const tx of tokenTransactions) {
      // Round to day for caching
      const dayTimestamp = Math.floor(tx.timestamp / 86400) * 86400;
      dates.add(dayTimestamp);
    }

    // Fetch price for each unique date
    for (const dayTimestamp of dates) {
      const cacheKey = `${tokenAddress}:${dayTimestamp}`;
      
      if (!priceCache.has(tokenAddress)) {
        priceCache.set(tokenAddress, new Map());
      }

      const price = await fetchHistoricalPrice(tokenAddress, dayTimestamp);
      if (price !== null) {
        priceCache.get(tokenAddress)!.set(dayTimestamp, price);
      }

      // Rate limiting: wait between API calls
      if (dates.size > 1) {
        await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS));
      }
    }
  }

  // Apply prices to transactions
  for (const tx of transactions) {
    const dayTimestamp = Math.floor(tx.timestamp / 86400) * 86400;
    const tokenCache = priceCache.get(tx.tokenAddress.toLowerCase());
    const price = tokenCache?.get(dayTimestamp);

    transactionsWithPrices.push({
      ...tx,
      priceUSD: price || undefined,
    });
  }

  return transactionsWithPrices;
}

