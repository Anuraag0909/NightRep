# NightRep — Decentralized Reputation System

## Project Overview

**NightRep** is a decentralized reputation system built on the **Midnight Blockchain**. It enables users to build, verify, and manage digital reputation in a privacy-focused and secure environment.

The system uses blockchain technology and privacy-preserving mechanisms to provide tamper-resistant reputation records while giving users greater control over their personal data and identity.

## Prerequisites

* Node.js (v18+)
* Docker (for the proof server, if running locally)
* Midnight 1AM Wallet (browser extension for the Preview Network)
* WSL2 (for Windows users to use the Compact compiler)

## Local Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Compile the Smart Contract

```bash
npm run compile
```

> **Note:** This uses the Compact compiler, which must be installed on your system or used through WSL.

### 3. Run the Tests

```bash
npm run test
```

The test suite covers circuit logic, state transitions, and privacy-related functionality.

## Frontend

The frontend is built with **React, Vite, and the Midnight JavaScript SDK**.

To run the frontend locally:

```bash
cd frontend
npm install
npm run dev
```

Alternatively, from the project root:

```bash
npm run frontend:dev
```

## Deployment

The smart contract is deployed to the **Midnight Preview Testnet**.

## Project Structure

```text
Credora/
├── contracts/
│   └── reputation.compact
├── frontend/
│   ├── public/
│   └── src/
├── src/
│   └── test-call.ts
├── package.json
├── package-lock.json
├── README.md
└── .gitignore
```

## About NightRep

NightRep is a privacy-focused, blockchain-based reputation platform designed to enable users to establish and verify digital reputation without unnecessarily exposing sensitive personal information.

By leveraging the Midnight Blockchain, the project aims to combine **verifiable reputation, privacy, and user-controlled identity** in a decentralized system.
