/**
 * Compliance Analysis API Endpoint
 * 
 * Analyzes wallet transactions for compliance risks and classifications.
 * Extends the tax calculation with compliance features.
 * 
 * This endpoint:
 * - Fetches transactions (reuses existing logic)
 * - Classifies transactions
 * - Detects compliance risks
 * - Returns compliance summary
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { fetchTransactions } from '../../src/services/etherscan';
import { assessWalletRisk, analyzeTransactionRisks } from '../../src/services/riskDetector';
import { classifyAllTransactions } from '../../src/services/transactionClassifier';
import { ComplianceSummary, RegulatoryAwareness } from '../../../shared/compliance-types';
import { Transaction } from '../../../shared/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress, chain, country } = req.body;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

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
            error: `Invalid ${chain === 'bsc' ? 'BSC' : 'Ethereum'} address format`
          });
        }
        break;
      case 'solana':
        isValidAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress);
        if (!isValidAddress) {
          return res.status(400).json({ error: 'Invalid Solana address format' });
        }
        break;
    }

    // For MVP, only Ethereum is fully supported
    if (chain === 'bsc' || chain === 'solana') {
      return res.status(200).json({
        success: true,
        data: {
          walletAddress,
          totalTransactions: 0,
          riskAssessment: {
            overallRisk: 'low',
            totalRiskyInteractions: 0,
            riskyInteractionPercentage: 0,
            riskFlags: [],
            flaggedContracts: [],
            flaggedAddresses: [],
          },
          classificationSummary: {
            totalTransactions: 0,
            classifiedCount: 0,
            unclassifiedCount: 0,
            classificationBreakdown: {
              trade: 0,
              transfer: 0,
              income: 0,
              nft: 0,
              bridge: 0,
              gas: 0,
              unclassified: 0,
            },
            classificationConfidence: 0,
          },
          complianceFlags: [],
          lastAnalyzed: Date.now(),
        } as ComplianceSummary,
        warning: `${chain === 'bsc' ? 'BSC' : 'Solana'} support is coming soon! Currently only Ethereum is fully integrated.`,
      });
    }

    // Step 1: Fetch transactions (reuse existing logic)
    console.log(`Fetching transactions for compliance analysis: ${walletAddress}...`);
    let transactions: Transaction[] = [];
    
    try {
      transactions = await fetchTransactions(walletAddress);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transactions';
      
      if (errorMessage.includes('API key')) {
        return res.status(400).json({
          success: false,
          error: errorMessage,
          hint: 'Please set a valid Etherscan API key in backend/.env.local',
        });
      }
      
      throw error;
    }

    if (transactions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          walletAddress,
          totalTransactions: 0,
          riskAssessment: {
            overallRisk: 'low',
            totalRiskyInteractions: 0,
            riskyInteractionPercentage: 0,
            riskFlags: [],
            flaggedContracts: [],
            flaggedAddresses: [],
          },
          classificationSummary: {
            totalTransactions: 0,
            classifiedCount: 0,
            unclassifiedCount: 0,
            classificationBreakdown: {
              trade: 0,
              transfer: 0,
              income: 0,
              nft: 0,
              bridge: 0,
              gas: 0,
              unclassified: 0,
            },
            classificationConfidence: 0,
          },
          complianceFlags: [],
          lastAnalyzed: Date.now(),
        } as ComplianceSummary,
        message: 'No transactions found for this wallet',
      });
    }

    // Step 2: Classify transactions
    console.log(`Classifying ${transactions.length} transactions...`);
    const classificationSummary = classifyAllTransactions(transactions);

    // Step 3: Assess wallet risk
    console.log(`Assessing wallet risk...`);
    const riskAssessment = assessWalletRisk(transactions);

    // Step 4: Generate compliance flags (high-level concerns)
    const complianceFlags: string[] = [];
    if (riskAssessment.overallRisk === 'high') {
      complianceFlags.push('High percentage of transactions with risk flags detected');
    }
    if (riskAssessment.totalRiskyInteractions > 0) {
      complianceFlags.push(`${riskAssessment.totalRiskyInteractions} transaction(s) flagged for review`);
    }
    if (classificationSummary.unclassifiedCount > classificationSummary.totalTransactions * 0.3) {
      complianceFlags.push('High percentage of unclassified transactions - manual review recommended');
    }

    // Step 5: Build compliance summary
    const complianceSummary: ComplianceSummary = {
      walletAddress,
      totalTransactions: transactions.length,
      riskAssessment,
      classificationSummary,
      complianceFlags,
      lastAnalyzed: Date.now(),
    };

    // Step 6: Return result
    return res.status(200).json({
      success: true,
      data: complianceSummary,
    });
  } catch (error) {
    console.error('Error in compliance analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}

