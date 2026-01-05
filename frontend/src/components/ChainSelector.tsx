/**
 * ChainSelector Component
 * 
 * Dropdown to select blockchain (Ethereum only for MVP)
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
  // MVP: Only Ethereum supported
  const chains = [
    { value: 'ethereum', label: 'Ethereum' },
  ];

  return (
    <div className="chain-selector">
      <label htmlFor="chain-select">Blockchain</label>
      <select
        id="chain-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {chains.map((chain) => (
          <option key={chain.value} value={chain.value}>
            {chain.label}
          </option>
        ))}
      </select>
    </div>
  );
};

