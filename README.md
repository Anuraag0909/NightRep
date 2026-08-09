# Decentralized Reputation System

## Project Overview
Decentralized Reputation System built for INTO the Midnight.

## Prerequisites
- Node.js (v18+)
- Docker (for proof server, if running locally)
- Midnight 1AM Wallet (browser extension for Preview Network)
- WSL2 (for Windows users to use the Compact compiler)

## Local Setup
1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Compile the Smart Contract:**
   ```bash
   npm run compile
   ```
   *(Note: This uses the Compact compiler which must be installed on your system or via WSL).*

3. **Run the Tests:**
   ```bash
   npm run test
   ```
   *The test suite covers circuit logic, state transitions, and verifies privacy properties.*

## Frontend Preview
The frontend is built with React, Vite, and the Midnight JS Testkit. To run the frontend locally:
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   Alternatively, you can run `npm run frontend:dev` from the root directory.

## Deployment Address
The smart contract is deployed to the Midnight Preview Testnet.


**Contract Address (Preview):** 
*(See deployment.txt for full deployment logs and address after faucet funding)*
contract_addr : [8e1ebd93209fcb4f61136b7f133f320116e1b9c7fc3307f355baf80da7c6285
] 
