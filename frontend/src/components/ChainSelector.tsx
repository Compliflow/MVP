/**
 * ChainSelector Component
 * 
 * Dropdown to select blockchain (Ethereum, BSC, Solana)
 */

import React from 'react';

interface ChainSelectorProps {
  value: string;
  onChange: (chain: string) => void;
  disabled?: boolean;
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const chains = [
    { value: 'ethereum', label: 'Ethereum', icon: '⛽' },
    { value: 'bsc', label: 'Binance Smart Chain (BSC)', icon: '🟡' },
    { value: 'solana', label: 'Solana', icon: '🟣' },
  ];

  return (
    <div className="chain-selector">
      <label htmlFor="chain-select">Blockchain Network</label>
      <select
        id="chain-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {chains.map((chain) => (
          <option key={chain.value} value={chain.value}>
            {chain.icon} {chain.label}
          </option>
        ))}
      </select>
    </div>
  );
};

