/**
 * Main App Component
 * 
 * Desktop-first, simple UI for crypto tax estimation
 */

import React, { useState } from 'react';
import { WalletInput } from './components/WalletInput';
import { ChainSelector } from './components/ChainSelector';
import { TaxResults } from './components/TaxResults';
import { Disclaimer } from './components/Disclaimer';
import { TaxCalculationResult, ApiResponse } from './types';
import './App.css';

const App: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [chain, setChain] = useState<string>('ethereum');
  const [results, setResults] = useState<TaxCalculationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleCalculate = async () => {
    // Validate input
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      setError('Please enter a valid Ethereum wallet address');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('http://localhost:3000/api/calculate-tax', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          chain,
        }),
      });

      const data: ApiResponse = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to calculate tax estimate');
        return;
      }

      if (data.data) {
        setResults(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>CompliFlow</h1>
        <p className="subtitle">Calculate your estimated tax liability using FIFO accounting</p>
      </header>

      <main className="app-main">
        <div className="input-section">
          <WalletInput
            value={walletAddress}
            onChange={setWalletAddress}
            disabled={loading}
          />
          <ChainSelector
            value={chain}
            onChange={setChain}
            disabled={loading}
          />
          <button
            onClick={handleCalculate}
            disabled={loading || !walletAddress}
            className="calculate-button"
          >
            {loading ? 'Calculating...' : 'Calculate Tax Estimate'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {results && (
          <TaxResults results={results} loading={loading} />
        )}

        <Disclaimer />
      </main>
    </div>
  );
};

export default App;

