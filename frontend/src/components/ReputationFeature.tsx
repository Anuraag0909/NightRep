import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { buildReputationContract } from '../utils/midnightProvider';
import { ledger } from '../../../contracts/managed/reputation/contract';
interface Props {
  providers: any;
  address: string;
}

export const ReputationFeature: React.FC<Props> = ({ providers, address }) => {
  const [score, setScore] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);
  const [receipt, setReceipt] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error' | ''>('');

  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '8f4da10f1fd7c42f2caa59988cd0d88fd3d41a30898c746ed325fed575654080';

  const fetchScore = async () => {
    if (!providers || !contractAddress) return;
    setStatusMsg('Fetching score...');
    setStatusType('info');
    try {
      const contractState = await providers.publicDataProvider.queryContractState(contractAddress);
      if (contractState) {
        const user = new Uint8Array(32);
        let userScore = 0n;
        try {
          // Attempt using the generated ledger helper
          const stateLedger = ledger(contractState.data);
          if (stateLedger.scores.member(user)) {
            userScore = stateLedger.scores.lookup(user);
          }
        } catch (ledgerErr) {
          console.warn("Ledger helper failed (likely Vite dual-package bug). Extracting raw state manually...", ledgerErr);
          // Fallback: manually parse the raw map out of the state tree to completely avoid module crashes
          try {
            const rawMap = (contractState.data as any).state.asArray()[0].asMap();
            const keys = rawMap.keys();
            for (const key of keys) {
              if (key.every((val: number, i: number) => val === user[i])) {
                userScore = BigInt(rawMap.get(key).asCell().value);
                break;
              }
            }
          } catch (manualErr) {
            console.error("Manual state extraction also failed.", manualErr);
          }
        }
        setScore(Number(userScore));
      } else {
        setScore(0);
      }
      setStatusMsg('');
      setStatusType('');
    } catch (err) {
      console.error(err);
      setStatusMsg('Error fetching score.');
      setStatusType('error');
    }
  };

  useEffect(() => {
    if (contractAddress && address) {
      fetchScore();
    }
  }, [contractAddress, address]);

  const handleRecordTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!providers || !address) return;
    
    if (!contractAddress) {
      // Just fallback to the default if it's missing to avoid blocking the user
      setStatusMsg('Warning: Contract address not in .env, using default.');
    }

    
    setIsSubmitting(true);
    setStatusMsg('Building contract call...');
    setStatusType('info');
    try {
      const contract = await buildReputationContract(providers, contractAddress);
      
      const user = new Uint8Array(32);
      if (address) {
        const encodedUser = new TextEncoder().encode(address);
        const start = Math.max(0, encodedUser.length - 32);
        user.set(encodedUser.slice(start));
      }
      
      // Build exactly 32 bytes for receipt (contract expects Bytes<32>)
      const uniqueReceipt = `${receipt}-${Math.floor(Math.random() * 1000000)}`.substring(0, 32);
      const receiptBuf = new Uint8Array(32);
      const encoded = new TextEncoder().encode(uniqueReceipt);
      receiptBuf.set(encoded.slice(0, 32));

      setStatusMsg('Step 1/3: Generating ZK proof locally...');
      
      const PROOF_TIMEOUT_MS = 10 * 60 * 1000; // Increased to 10 minutes
      
      // We wrap just the callTx in the timeout. But wait, callTx also balances!
      // Let's hook into the providers to update the status message dynamically!
      // To do this, we can redefine the walletProvider methods temporarily for this call!
      const originalBalanceTx = providers.walletProvider.balanceTx;
      const originalSubmitTx = providers.midnightProvider.submitTx;
      
      providers.walletProvider.balanceTx = async (tx: any, ttl?: Date) => {
        setStatusMsg('Step 2/3: Awaiting wallet signature (check extension popup)...');
        return originalBalanceTx.call(providers.walletProvider, tx, ttl);
      };
      
      providers.midnightProvider.submitTx = async (tx: any) => {
        setStatusMsg('Step 3/3: Submitting to blockchain...');
        return originalSubmitTx.call(providers.midnightProvider, tx);
      };

      try {
        const tx = await Promise.race([
          contract.callTx.record_trade(user, BigInt(amount), receiptBuf),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(
              'Process timed out.'
            )), PROOF_TIMEOUT_MS)
          ),
        ]);

        setStatusMsg('Success! Tx hash: ' + (tx as any).txHash);
        setStatusType('success');
        await fetchScore();
      } finally {
        // Restore providers
        providers.walletProvider.balanceTx = originalBalanceTx;
        providers.midnightProvider.submitTx = originalSubmitTx;
      }
    } catch (err: any) {
      console.error(err);
      setStatusMsg('Error: ' + err.message);
      setStatusType('error');
    } finally {
      setIsSubmitting(false);
      setReceipt('');
    }
  };

  return (
    <div className="dashboard-feature">
      <motion.div 
        className="feature-header"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", bounce: 0, duration: 0.8 }}
      >
        <div className="feature-title">
           <h2>Welcome to your NightRep Dashboard</h2>
           <p>Experience and Maximize the Benefits of Zero-Knowledge Features</p>
        </div>
      </motion.div>

      <div className="feature-grid">
         <motion.div 
            className="overview-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", bounce: 0, duration: 0.8, delay: 0.1 }}
         >
            <div className="card-header">
               <h3>Overview</h3>
               <span className="dropdown-badge">All time v</span>
            </div>
            <div className="score-big">
               <span className="score-value">{score}</span>
               <span className="score-label">Reputation Score</span>
            </div>
            <p className="contract-address">Contract: {contractAddress ? contractAddress.slice(0,10) + '...' : 'Not Configured'}</p>
         </motion.div>

         <motion.div 
            className="action-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", bounce: 0, duration: 0.8, delay: 0.2 }}
         >
            <div className="card-header">
               <h3>Record Transaction</h3>
            </div>
            <form onSubmit={handleRecordTrade} className="record-form">
              <div className="input-group">
                <label>Trade Amount</label>
                <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} min="1" required disabled={isSubmitting} />
              </div>
              <div className="input-group">
                <label>Secret Receipt (Private)</label>
                <input type="password" value={receipt} onChange={(e) => setReceipt(e.target.value)} required disabled={isSubmitting} />
              </div>
              <motion.button 
                type="submit" 
                className="btn-solid full-width" 
                disabled={isSubmitting || !providers}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              >
                {isSubmitting ? 'Processing...' : 'Record Trade'}
              </motion.button>
              {statusMsg && (
                <div className={`status-alert ${statusType}`}>
                  {statusType === 'success' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  )}
                  {statusType === 'error' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  )}
                  {statusType === 'info' && (
                    <div className="spinner"></div>
                  )}
                  <span className="status-text">{statusMsg}</span>
                </div>
              )}
            </form>
         </motion.div>
      </div>
    </div>
  );
};
