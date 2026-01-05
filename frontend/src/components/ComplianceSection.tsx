/**
 * Compliance & Risk Section Component
 * 
 * Displays compliance analysis including:
 * - Risk assessment
 * - Transaction classification summary
 * - Compliance flags
 * - Regulatory awareness
 */

import React, { useState, useEffect } from 'react';
import { ComplianceSummary } from '../../../shared/compliance-types';

interface ComplianceSectionProps {
  walletAddress: string;
  chain: string;
  country: string;
  onAnalysisComplete?: (summary: ComplianceSummary) => void;
}

export const ComplianceSection: React.FC<ComplianceSectionProps> = ({
  walletAddress,
  chain,
  country,
  onAnalysisComplete,
}) => {
  const [summary, setSummary] = useState<ComplianceSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!walletAddress) {
      setSummary(null);
      return;
    }

    const fetchComplianceAnalysis = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('http://localhost:3000/api/compliance-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress,
            chain,
            country,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          setError(data.error || 'Failed to analyze compliance');
          return;
        }

        if (data.data) {
          setSummary(data.data);
          if (onAnalysisComplete) {
            onAnalysisComplete(data.data);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchComplianceAnalysis();
  }, [walletAddress, chain, country, onAnalysisComplete]);

  // Always show section if wallet address is provided (even if no results yet)
  // This allows the section to be visible and show loading state

  if (loading) {
    return (
      <div className="compliance-section loading">
        <h2>Compliance & Risk Analysis</h2>
        <p>Analyzing wallet for compliance risks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="compliance-section error">
        <h2>Compliance & Risk Analysis</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return '#f87171';
      case 'medium':
        return '#fbbf24';
      case 'low':
        return '#4ade80';
      default:
        return '#999';
    }
  };

  const getRiskLabel = (risk: string) => {
    return risk.charAt(0).toUpperCase() + risk.slice(1);
  };

  return (
    <div className="compliance-section">
      <h2>Compliance & Risk Analysis</h2>

      {/* Risk Assessment Card */}
      <div className="compliance-card risk-assessment">
        <h3>Risk Assessment</h3>
        <div className="risk-indicator">
          <span
            className="risk-badge"
            style={{ backgroundColor: getRiskColor(summary.riskAssessment.overallRisk) }}
          >
            {getRiskLabel(summary.riskAssessment.overallRisk)} Risk
          </span>
        </div>
        <div className="risk-metrics">
          <div className="metric">
            <span className="metric-label">Risky Interactions:</span>
            <span className="metric-value">
              {summary.riskAssessment.totalRiskyInteractions} / {summary.totalTransactions}
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Risk Percentage:</span>
            <span className="metric-value">
              {summary.riskAssessment.riskyInteractionPercentage.toFixed(2)}%
            </span>
          </div>
          {summary.riskAssessment.flaggedContracts.length > 0 && (
            <div className="metric">
              <span className="metric-label">Flagged Contracts:</span>
              <span className="metric-value">
                {summary.riskAssessment.flaggedContracts.length}
              </span>
            </div>
          )}
        </div>
        {summary.riskAssessment.riskFlags.length > 0 && (
          <div className="risk-flags">
            <h4>Risk Flags Detected:</h4>
            <ul>
              {summary.riskAssessment.riskFlags.slice(0, 5).map((flag, index) => (
                <li key={index}>
                  <span className="flag-type">{flag.type.replace('_', ' ')}</span>
                  <span className="flag-description">{flag.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Classification Summary Card */}
      <div className="compliance-card classification">
        <h3>Transaction Classification</h3>
        <div className="classification-stats">
          <div className="stat">
            <span className="stat-label">Total Transactions:</span>
            <span className="stat-value">{summary.classificationSummary.totalTransactions}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Classified:</span>
            <span className="stat-value">
              {summary.classificationSummary.classifiedCount} (
              {((summary.classificationSummary.classifiedCount / summary.classificationSummary.totalTransactions) * 100).toFixed(1)}%)
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Unclassified:</span>
            <span className="stat-value">
              {summary.classificationSummary.unclassifiedCount} (
              {((summary.classificationSummary.unclassifiedCount / summary.classificationSummary.totalTransactions) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
        <div className="classification-breakdown">
          <h4>Breakdown:</h4>
          <div className="breakdown-grid">
            {Object.entries(summary.classificationSummary.classificationBreakdown).map(([type, count]) => (
              count > 0 && (
                <div key={type} className="breakdown-item">
                  <span className="breakdown-type">{type}</span>
                  <span className="breakdown-count">{count}</span>
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Flags Card */}
      {summary.complianceFlags.length > 0 && (
        <div className="compliance-card flags">
          <h3>Compliance Flags</h3>
          <ul className="flags-list">
            {summary.complianceFlags.map((flag, index) => (
              <li key={index}>{flag}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Regulatory Awareness */}
      <div className="compliance-card regulatory">
        <h3>Regulatory Awareness</h3>
        <div className="regulatory-info">
          <p className="disclaimer-text">
            <strong>Informational — Not Legal or Tax Advice</strong>
          </p>
          <p>
            Based on your wallet activity, you may need to consider:
          </p>
          <ul>
            <li>Capital gains reporting obligations</li>
            <li>Income reporting requirements</li>
            <li>Record keeping obligations</li>
          </ul>
          <p className="note">
            This information is for awareness purposes only. Consult with a qualified tax or legal professional for advice specific to your situation.
          </p>
        </div>
      </div>
    </div>
  );
};

