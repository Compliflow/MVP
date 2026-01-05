/**
 * Disclaimer Component
 * 
 * Important legal disclaimer about tax estimates
 */

import React from 'react';

export const Disclaimer: React.FC = () => {
  return (
    <div className="disclaimer">
      <p>
        <strong>Disclaimer:</strong> This is an estimate only and does not constitute tax advice.
        Tax calculations are based on simplified rules and may not reflect your actual tax liability.
        Consult with a qualified tax professional for accurate tax advice.
      </p>
    </div>
  );
};

