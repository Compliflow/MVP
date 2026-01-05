/**
 * WalletInput Component
 * 
 * Input field for wallet address with validation
 */

import React, { useState } from 'react';

interface WalletInputProps {
  value: string;
  onChange: (address: string) => void;
  disabled?: boolean;
}

export const WalletInput: React.FC<WalletInputProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    onChange(address);

    // Basic Ethereum address validation
    if (address && !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setError('Invalid Ethereum address format');
    } else {
      setError('');
    }
  };

  return (
    <div className="wallet-input">
      <label htmlFor="wallet-address">Wallet Address</label>
      <input
        id="wallet-address"
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="0x..."
        disabled={disabled}
        className={error ? 'error' : ''}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

