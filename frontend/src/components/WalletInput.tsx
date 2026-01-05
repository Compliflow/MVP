/**
 * WalletInput Component
 * 
 * Input field for wallet address with validation for Ethereum, BSC, and Solana
 */

import React, { useState } from 'react';

interface WalletInputProps {
  value: string;
  onChange: (address: string) => void;
  chain: string;
  disabled?: boolean;
}

// Validate wallet address based on chain
const validateAddress = (address: string, chain: string): string => {
  if (!address) return '';

  switch (chain) {
    case 'ethereum':
    case 'bsc':
      // Ethereum and BSC use same format: 0x followed by 40 hex characters
      if (!/^0x[a-fA-F0-9]{40}$/i.test(address)) {
        return `Invalid ${chain === 'bsc' ? 'BSC' : 'Ethereum'} address format (should be 0x followed by 40 hex characters)`;
      }
      return '';
    
    case 'solana':
      // Solana addresses are base58 encoded, typically 32-44 characters
      // Base58: 1-9, A-H, J-N, P-Z, a-k, m-z (no 0, O, I, l)
      if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
        return 'Invalid Solana address format (should be 32-44 base58 characters)';
      }
      return '';
    
    default:
      return '';
  }
};

export const WalletInput: React.FC<WalletInputProps> = ({
  value,
  onChange,
  chain,
  disabled = false,
}) => {
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    onChange(address);
    setError(validateAddress(address, chain));
  };

  // Re-validate when chain changes
  React.useEffect(() => {
    if (value) {
      setError(validateAddress(value, chain));
    }
  }, [chain, value]);

  const getPlaceholder = () => {
    switch (chain) {
      case 'ethereum':
      case 'bsc':
        return '0x...';
      case 'solana':
        return 'Enter Solana address...';
      default:
        return 'Enter wallet address...';
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
        placeholder={getPlaceholder()}
        disabled={disabled}
        className={error ? 'error' : ''}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

