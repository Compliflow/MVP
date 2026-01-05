/**
 * CountrySelector Component
 * 
 * Dropdown to select tax jurisdiction country
 */

import React from 'react';

interface CountrySelectorProps {
  value: string;
  onChange: (country: string) => void;
  disabled?: boolean;
}

const countries = [
  { value: 'ireland', label: 'Ireland', flag: '🇮🇪' },
  { value: 'united_states', label: 'United States', flag: '🇺🇸' },
  { value: 'united_kingdom', label: 'United Kingdom', flag: '🇬🇧' },
  { value: 'canada', label: 'Canada', flag: '🇨🇦' },
  { value: 'australia', label: 'Australia', flag: '🇦🇺' },
  { value: 'germany', label: 'Germany', flag: '🇩🇪' },
  { value: 'france', label: 'France', flag: '🇫🇷' },
  { value: 'japan', label: 'Japan', flag: '🇯🇵' },
  { value: 'singapore', label: 'Singapore', flag: '🇸🇬' },
  { value: 'switzerland', label: 'Switzerland', flag: '🇨🇭' },
];

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="country-selector">
      <label htmlFor="country-select">Tax Jurisdiction</label>
      <select
        id="country-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {countries.map((country) => (
          <option key={country.value} value={country.value}>
            {country.flag} {country.label}
          </option>
        ))}
      </select>
    </div>
  );
};

