# CompliFlow

**CompliFlow** is a modern, utility-focused web application for estimating cryptocurrency tax liability using FIFO (First-In-First-Out) accounting methodology. Built with clarity, correctness, and simplicity in mind.

![CompliFlow](https://img.shields.io/badge/Status-MVP-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)

## 🎯 What Does This Project Do?

CompliFlow helps cryptocurrency users estimate their tax liability by:

1. **Fetching On-Chain Transactions**: Retrieves all token transfers from blockchain networks (Ethereum, BSC, Solana)
2. **Historical Price Lookup**: Fetches accurate USD prices for tokens at the time of each transaction
3. **FIFO Accounting**: Calculates realized gains and losses using First-In-First-Out methodology
4. **Tax Estimation**: Applies simplified tax rules (33% Capital Gains Tax for Ireland) to calculate estimated tax due

### Key Features

- ✅ **Multi-Chain Support**: Ethereum, Binance Smart Chain (BSC), and Solana
- ✅ **FIFO Accounting**: Accurate cost basis tracking with oldest-first matching
- ✅ **No Authentication Required**: Simple, direct utility - just enter a wallet address
- ✅ **Desktop-First UI**: Clean, modern interface with gradient design
- ✅ **Real-Time Calculations**: Fetches live transaction data from blockchain APIs
- ✅ **Error Handling**: Graceful timeouts and helpful error messages

## 🏗️ Architecture

```
User Input (Wallet Address + Chain)
    ↓
Frontend (React + TypeScript)
    ↓
Backend API (Next.js)
    ├──→ Etherscan/BSCScan API (Transaction Data)
    ├──→ CoinGecko API (Historical Prices)
    └──→ FIFO PnL Calculator
    ↓
Tax Estimation Results
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Free Etherscan API key ([Get one here](https://etherscan.io/apis))

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Compliflow/MVP.git
   cd MVP
   ```

2. **Install dependencies**:
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Configure API key**:
   ```bash
   cd backend
   echo "ETHERSCAN_API_KEY=your_api_key_here" > .env.local
   ```

4. **Start servers**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   PORT=3001 npm run dev
   ```

5. **Open browser**: Navigate to `http://localhost:3001`

## 📖 How It Works

### FIFO Accounting Explained

FIFO (First-In-First-Out) ensures that when you sell tokens, the oldest tokens in your inventory are matched first:

**Example:**
1. Buy 100 USDC at $1.00 → Added to inventory
2. Buy 50 USDC at $1.10 → Added to inventory
3. Sell 75 USDC at $1.20 → Matches against oldest 75 (from first purchase)
   - Cost basis: 75 × $1.00 = $75
   - Sale value: 75 × $1.20 = $90
   - **Realized gain: $15**

### Tax Calculation

- **Total Realized Gains**: Sum of all profitable transactions
- **Total Realized Losses**: Sum of all loss transactions
- **Net Taxable Gain**: Gains - Losses
- **Estimated Tax Due**: Net Taxable Gain × 33% (Ireland rate)

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Backend**: Next.js 14 (API Routes)
- **APIs**:
  - Etherscan API V2 (Ethereum transactions)
  - CoinGecko API (Historical token prices)
- **Styling**: CSS with modern gradients and animations

## 📁 Project Structure

```
CompliFlow/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── App.tsx       # Main application
│   │   └── App.css       # Modern styling
│   └── package.json
├── backend/              # Next.js backend
│   ├── pages/api/       # API routes
│   ├── src/services/    # Business logic
│   │   ├── pnlCalculator.ts    # Core FIFO logic
│   │   ├── etherscan.ts        # Transaction fetching
│   │   └── coingecko.ts        # Price fetching
│   └── package.json
├── shared/               # Shared TypeScript types
└── README.md
```

## ⚠️ Current Limitations (MVP)

- **Ethereum Only**: BSC and Solana UI ready, backend integration pending
- **ERC-20 Tokens Only**: No native ETH, no NFTs
- **No Gas Fee Accounting**: Gas costs not included in calculations
- **Simplified Tax Rules**: No exemptions, no allowances
- **Rate Limiting**: Large wallets may timeout (50 query limit for MVP)
- **No Data Persistence**: Calculations are not saved

## 🔮 Future Scope & Enhancements

### Phase 2: Multi-Chain Support
- [ ] **BSC Integration**: Full BSCScan API integration for Binance Smart Chain
- [ ] **Solana Integration**: Solana RPC client for transaction fetching
- [ ] **Polygon Support**: Add Polygon network support
- [ ] **Arbitrum & Optimism**: Layer 2 network support
- [ ] **Multi-Chain Aggregation**: Combine transactions across all chains

### Phase 3: Enhanced Transaction Types
- [ ] **Native ETH/BNB Transactions**: Support for native token transfers
- [ ] **NFT Support**: Calculate gains/losses for NFT sales
- [ ] **Staking Rewards**: Track and tax staking income
- [ ] **Airdrops**: Handle airdrop transactions
- [ ] **DeFi Interactions**: Lending, borrowing, yield farming
- [ ] **Gas Fee Accounting**: Include gas costs in cost basis

### Phase 4: Advanced Tax Features
- [ ] **Multiple Tax Jurisdictions**: Support for US, UK, EU countries
- [ ] **Tax Year Selection**: Calculate for specific tax years
- [ ] **Exemptions & Allowances**: Implement country-specific tax rules
- [ ] **Wash Sale Rules**: Detect and handle wash sales
- [ ] **Holding Period Rules**: Short-term vs long-term capital gains
- [ ] **Tax Loss Harvesting**: Identify optimal sell strategies

### Phase 5: User Experience
- [ ] **Progress Indicators**: Real-time progress for long calculations
- [ ] **Transaction Breakdown**: Detailed view of each transaction's PnL
- [ ] **Export Functionality**: CSV/PDF export of tax reports
- [ ] **Historical Data**: Save and compare calculations over time
- [ ] **Multiple Wallets**: Track multiple wallet addresses
- [ ] **Portfolio View**: Aggregate view across all wallets

### Phase 6: Performance & Scale
- [ ] **Caching Layer**: Redis cache for price data
- [ ] **Background Processing**: Queue system for large wallets
- [ ] **Batch Processing**: Process transactions in parallel
- [ ] **Database Integration**: Store calculation history
- [ ] **API Rate Limit Optimization**: Smart batching and caching

### Phase 7: Enterprise Features
- [ ] **User Accounts**: Optional authentication for saving data
- [ ] **Team Workspaces**: Share calculations with accountants
- [ ] **API Access**: Programmatic access for tax professionals
- [ ] **Audit Trail**: Complete history of all calculations
- [ ] **Compliance Reports**: Generate official tax documents

## 🎨 Design Philosophy

CompliFlow follows these core principles:

- **No Authentication**: Direct utility, no sign-up required
- **No Payments**: Free to use (uses free-tier APIs)
- **No Tokens**: No cryptocurrency or token requirements
- **Pure Utility**: Focus on correctness and clarity
- **Desktop-First**: Optimized for desktop use
- **Transparency**: Clear disclaimers and error messages

## 📝 API Documentation

### Calculate Tax Endpoint

**POST** `/api/calculate-tax`

**Request:**
```json
{
  "walletAddress": "0x...",
  "chain": "ethereum" | "bsc" | "solana"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRealizedGains": 1234.56,
    "totalRealizedLosses": 234.56,
    "netTaxableGain": 1000.00,
    "estimatedTaxDue": 330.00,
    "taxRate": 0.33,
    "transactionCount": 150,
    "pnlBreakdown": [...]
  }
}
```

## 🔒 Privacy & Security

- **No Data Storage**: Wallet addresses are never stored
- **API-Only**: All data fetched on-demand from public APIs
- **No Tracking**: No analytics or user tracking
- **Client-Side Processing**: Calculations happen server-side but data isn't persisted

## ⚖️ Disclaimer

**This is an estimate only and does not constitute tax advice.** Tax calculations are based on simplified rules and may not reflect your actual tax liability. Consult with a qualified tax professional for accurate tax advice.

## 🤝 Contributing

This is currently an MVP. Contributions and feedback are welcome!

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Etherscan for blockchain data APIs
- CoinGecko for historical price data
- Built with React, Next.js, and TypeScript

---

**Built with ❤️ for the crypto community**
