/**
 * Main App Component
 * 
 * Desktop-first, simple UI for crypto tax estimation
 */

import React, { useState, useEffect } from 'react';
import { WalletInput } from './components/WalletInput';
import { ChainSelector } from './components/ChainSelector';
import { CountrySelector } from './components/CountrySelector';
import { TaxResults } from './components/TaxResults';
import { ComplianceSection } from './components/ComplianceSection';
import { Disclaimer } from './components/Disclaimer';
import { TaxCalculationResult, ApiResponse } from './types';
import './App.css';

const App: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [chain, setChain] = useState<string>('ethereum');
  const [country, setCountry] = useState<string>('ireland');
  const [results, setResults] = useState<TaxCalculationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Reset wallet address when chain or country changes
  useEffect(() => {
    setWalletAddress('');
    setError('');
    setResults(null);
  }, [chain, country]);

  const validateAddress = (address: string, chain: string): boolean => {
    if (!address) return false;
    
    switch (chain) {
      case 'ethereum':
      case 'bsc':
        return /^0x[a-fA-F0-9]{40}$/i.test(address);
      case 'solana':
        return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
      default:
        return false;
    }
  };

  const handleCalculate = async () => {
    // Validate input
    if (!walletAddress || !validateAddress(walletAddress, chain)) {
      const chainName = chain === 'bsc' ? 'BSC' : chain === 'solana' ? 'Solana' : 'Ethereum';
      setError(`Please enter a valid ${chainName} wallet address`);
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      // Set a timeout of 6 minutes (slightly longer than backend timeout)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6 * 60 * 1000);
      
      const response = await fetch('http://localhost:3000/api/calculate-tax', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          chain,
          country,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      const data: ApiResponse = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to calculate tax estimate');
        return;
      }

      if (data.data) {
        setResults(data.data);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out. This wallet has too many transactions. The calculation is taking longer than 6 minutes. Try a wallet with fewer transactions, or wait for the calculation to complete.');
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
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
            chain={chain}
            disabled={loading}
          />
          <ChainSelector
            value={chain}
            onChange={setChain}
            disabled={loading}
          />
          <CountrySelector
            value={country}
            onChange={setCountry}
            disabled={loading}
          />
          <button
            onClick={handleCalculate}
            disabled={loading || !walletAddress}
            className="calculate-button"
            onMouseEnter={(e) => {
              if (!loading && walletAddress) {
                e.currentTarget.style.transform = 'translateY(-3px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && walletAddress) {
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid rgba(255,255,255,0.3)', 
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  display: 'inline-block'
                }}></span>
                Calculating...
              </span>
            ) : (
              'Calculate Tax Estimate'
            )}
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

        {walletAddress && (
          <ComplianceSection
            walletAddress={walletAddress}
            chain={chain}
            country={country}
          />
        )}

        <Disclaimer />
      </main>
    </div>
  );
};

export default App;

