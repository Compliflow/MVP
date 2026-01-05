/**
 * TaxResults Component
 * 
 * Displays calculated tax results in a clear, simple format
 */

import React from 'react';
import { TaxCalculationResult } from '../types';

interface TaxResultsProps {
  results: TaxCalculationResult;
  loading?: boolean;
}

export const TaxResults: React.FC<TaxResultsProps> = ({
  results,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="tax-results loading">
        <p>Calculating tax estimate...</p>
      </div>
    );
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="tax-results">
      <h2>Tax Estimate</h2>
      
      <div className="results-grid">
        <div className="result-item">
          <span className="label">Total Realized Gains:</span>
          <span className="value positive">{formatCurrency(results.totalRealizedGains)}</span>
        </div>

        <div className="result-item">
          <span className="label">Total Realized Losses:</span>
          <span className="value negative">{formatCurrency(results.totalRealizedLosses)}</span>
        </div>

        <div className="result-item">
          <span className="label">Net Taxable Gain:</span>
          <span className={`value ${results.netTaxableGain >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(results.netTaxableGain)}
          </span>
        </div>

        <div className="result-item highlight">
          <span className="label">Estimated Tax Due:</span>
          <span className="value highlight-value">
            {formatCurrency(results.estimatedTaxDue)}
          </span>
        </div>

        <div className="result-item meta">
          <span className="label">Tax Rate:</span>
          <span className="value">{(results.taxRate * 100).toFixed(0)}%</span>
        </div>

        <div className="result-item meta">
          <span className="label">Transactions Processed:</span>
          <span className="value">{results.transactionCount}</span>
        </div>
      </div>
    </div>
  );
};

