# Compliance Features - Known Limitations

This document outlines the current limitations of the compliance features in CompliFlow MVP.

## Risk Detection

### Scam Contract Detection
- **Current State**: Uses placeholder dataset (empty in MVP)
- **Limitation**: No actual scam contract database integrated
- **Future**: Integrate with public scam databases (e.g., Etherscan's verified scam list, community-maintained lists)
- **Note**: Risk detection will return "low risk" until datasets are integrated

### Blacklisted Address Detection
- **Current State**: Uses placeholder dataset (empty in MVP)
- **Limitation**: No OFAC SDN list or similar compliance database integrated
- **Future**: Integrate with OFAC SDN list or similar public compliance datasets
- **Note**: Risk detection will return "low risk" until datasets are integrated

### High-Risk Protocol Tagging
- **Current State**: Uses placeholder dataset (empty in MVP)
- **Limitation**: No protocol risk database integrated
- **Future**: Integrate with protocol risk tagging systems (community-maintained or commercial)
- **Note**: Risk detection will return "low risk" until datasets are integrated

## Transaction Classification

### Classification Accuracy
- **Current State**: Basic heuristics (self-transfer detection, zero-amount detection)
- **Limitation**: Many transactions will be classified as "unclassified"
- **Future**: 
  - Integrate with known contract addresses (staking, rewards, bridges, NFTs)
  - Use contract type detection (ERC-721, ERC-1155 for NFTs)
  - Pattern matching for common DeFi protocols
  - Machine learning classification (future enhancement)

### Income Detection
- **Current State**: Placeholder logic (returns false)
- **Limitation**: Cannot detect airdrops, staking rewards, or other income
- **Future**: Integrate with known staking/rewards contract addresses

### NFT Detection
- **Current State**: Placeholder logic (returns false)
- **Limitation**: Cannot detect NFT transactions
- **Future**: 
  - Check contract type (ERC-721, ERC-1155)
  - Integrate with known NFT collection addresses

### Bridge Detection
- **Current State**: Placeholder logic (returns false)
- **Limitation**: Cannot detect cross-chain bridge transactions
- **Future**: Integrate with known bridge contract addresses

## Data Sources

### Public Datasets
- **Current State**: No external datasets integrated
- **Limitation**: All risk detection relies on empty placeholder datasets
- **Future**: 
  - Integrate OFAC SDN list for sanctions
  - Integrate community-maintained scam databases
  - Integrate protocol risk tagging systems

### API Rate Limits
- **Current State**: Uses existing Etherscan API (same rate limits as tax calculation)
- **Limitation**: Large wallets may timeout
- **Future**: Implement caching and batch processing

## Manual Override

### Classification Override
- **Current State**: Data model supports manual override, but no UI
- **Limitation**: Users cannot manually correct classifications
- **Future**: Add UI for manual classification override

### Risk Flag Override
- **Current State**: Not implemented
- **Limitation**: Users cannot dispute or override risk flags
- **Future**: Add UI for risk flag review and override

## Regulatory Awareness

### Country-Specific Guidance
- **Current State**: Generic guidance for all countries
- **Limitation**: Not country-specific (despite country selector)
- **Future**: Add country-specific regulatory considerations

### Legal Disclaimer
- **Current State**: Generic disclaimer
- **Limitation**: May not cover all jurisdictions
- **Future**: Add jurisdiction-specific disclaimers

## Multi-Chain Support

### BSC and Solana
- **Current State**: Placeholder responses (returns empty compliance summary)
- **Limitation**: Compliance analysis only works for Ethereum
- **Future**: 
  - Integrate BSCScan API for BSC transactions
  - Integrate Solana RPC for Solana transactions
  - Extend risk detection to other chains

## Performance

### Large Wallets
- **Current State**: Same timeout limits as tax calculation (5 minutes)
- **Limitation**: Very large wallets may timeout
- **Future**: 
  - Background processing
  - Incremental analysis
  - Caching layer

## Privacy

### Data Storage
- **Current State**: No data storage (read-only analysis)
- **Limitation**: Analysis must be re-run each time
- **Future**: Optional caching (with user consent)

## Compliance Assumptions

### Risk Assessment Formula
- **Current State**: Simple percentage-based (0-5% = low, 5-20% = medium, >20% = high)
- **Limitation**: May not reflect actual compliance risk
- **Future**: More sophisticated risk scoring algorithm

### Neutral Language
- **Current State**: All risk flags use neutral, informational language
- **Note**: This is intentional - no accusations, just awareness
- **Future**: Maintain neutral language in all compliance features

---

**Last Updated**: MVP v1.0
**Status**: All compliance features are functional but use placeholder data. Risk detection will show "low risk" until datasets are integrated.

