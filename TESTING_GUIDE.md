# Testing Guide for CompliFlow

## Step-by-Step Testing Instructions

### 1. Prerequisites Check

First, verify you have Node.js installed:

```bash
node --version  # Should be 18.0.0 or higher
npm --version   # Should be 8.0.0 or higher
```

If not installed, download from [nodejs.org](https://nodejs.org/)

### 2. Get Etherscan API Key (Required)

1. Go to https://etherscan.io/apis
2. Sign up for a free account (if you don't have one)
3. Create a new API key
4. Copy the API key (looks like: `ABC123XYZ...`)

### 3. Install Dependencies

```bash
# Navigate to project
cd /Users/apathan/CompliFlow

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 4. Configure Environment Variables

Create the environment file for the backend:

```bash
cd /Users/apathan/CompliFlow/backend
echo "ETHERSCAN_API_KEY=your_actual_api_key_here" > .env.local
```

**Important**: Replace `your_actual_api_key_here` with your real Etherscan API key!

### 5. Start the Backend Server

Open **Terminal 1**:

```bash
cd /Users/apathan/CompliFlow/backend
npm run dev
```

You should see:
```
✓ Ready in X seconds
○ Local: http://localhost:3000
```

**Keep this terminal open!**

### 6. Start the Frontend Server

Open **Terminal 2** (new terminal window):

```bash
cd /Users/apathan/CompliFlow/frontend
npm run dev
```

You should see:
```
Compiled successfully!
You can now view the app in the browser.
  Local: http://localhost:3001
```

### 7. Test the Dashboard

1. **Open your browser** and go to: `http://localhost:3001`

2. **You should see**:
   - "CompliFlow" header
   - Wallet address input field
   - Chain selector (Ethereum)
   - "Calculate Tax Estimate" button

3. **Test with a real wallet address**:
   - Try: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb` (Vitalik's wallet - has many transactions)
   - Or any Ethereum wallet address you know

4. **Click "Calculate Tax Estimate"**

5. **What to expect**:
   - Button shows "Calculating..." (disabled)
   - May take 1-5 minutes depending on number of transactions
   - Results will show:
     - Total Realized Gains
     - Total Realized Losses
     - Net Taxable Gain
     - Estimated Tax Due (33%)

### 8. Test Scenarios

#### Test 1: Valid Wallet Address
- Enter: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
- Expected: Calculation runs and shows results

#### Test 2: Invalid Address Format
- Enter: `invalid-address`
- Expected: Error message "Please enter a valid Ethereum wallet address"

#### Test 3: Empty Address
- Leave field empty
- Expected: Button is disabled

#### Test 4: Wallet with No Transactions
- Enter a new/empty wallet address
- Expected: Shows $0 for all values, 0 transactions processed

### 9. Check Backend Logs

Watch Terminal 1 (backend) for logs:
- `Fetching transactions for 0x...`
- `Fetching historical prices for X transactions...`
- `Calculating PnL for X transactions...`

### 10. Common Issues & Solutions

**Issue: "Module not found" errors**
```bash
# Solution: Reinstall dependencies
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
```

**Issue: "Etherscan API error"**
- Check `.env.local` file exists in `backend/` directory
- Verify API key is correct (no extra spaces)
- Check Etherscan account is active

**Issue: "Cannot connect to API"**
- Make sure backend is running on port 3000
- Check `frontend/src/App.tsx` has correct API URL
- Try: `curl http://localhost:3000/api/calculate-tax` (should return 405 Method Not Allowed - that's OK, means server is running)

**Issue: Frontend shows "Failed to fetch"**
- Backend might not be running
- Check CORS settings (if needed)
- Verify API endpoint URL in `App.tsx`

**Issue: Very slow calculation**
- Normal for wallets with many transactions
- CoinGecko rate limiting (7 seconds between calls)
- Check backend logs to see progress

### 11. Quick Test Script

You can test the API directly with curl:

```bash
curl -X POST http://localhost:3000/api/calculate-tax \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb","chain":"ethereum"}'
```

This should return JSON with tax calculation results.

### 12. Expected Results Format

When successful, you should see:

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

### 13. Stop the Servers

- Press `Ctrl+C` in both terminal windows to stop the servers

## Next Steps After Testing

- Review the calculation logic in `backend/src/services/pnlCalculator.ts`
- Check transaction data in backend logs
- Verify FIFO accounting is working correctly
- Test with different wallet addresses
- Review the UI/UX and suggest improvements

## Need Help?

- Check `README.md` for general information
- Check `QUICK_START.md` for setup instructions
- Check `ARCHITECTURE.md` for system design
- Check `IMPLEMENTATION_NOTES.md` for technical details

