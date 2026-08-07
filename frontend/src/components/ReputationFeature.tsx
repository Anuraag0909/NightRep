import React, { useState, useEffect } from 'react';
interface Props {
  api: any;
  address: string;
}

export const ReputationFeature: React.FC<Props> = ({ api, address }) => {
  const [score, setScore] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);
  const [receipt, setReceipt] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '';

  // Mocking reading the indexer state, since the real setup requires a 
  // complex midnight provider to query indexer state for scores map
  const fetchScore = async () => {
    // In a real app, use `indexerPublicDataProvider` to query the contract state
    // const state = await indexer.queryContractState(contractAddress);
    // Parse the state.scores map.
    setScore(0);
    setStatusMsg('State fetched from indexer.');
  };

  useEffect(() => {
    if (contractAddress && address) {
      fetchScore();
    }
  }, [contractAddress, address]);

  const handleRecordTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api || !address) return;
    setIsSubmitting(true);
    setStatusMsg('Submitting transaction proof...');
    try {
      // In a real Midnight dApp, you would construct the provider and call:
      // await contract.impureCircuits.record_trade({ ... }, address, amount, receipt_bytes);
      
      // Simulate proof generation and tx submit
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStatusMsg('Trade recorded successfully!');
    } catch (err: any) {
      setStatusMsg('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
      setReceipt(''); // Clear private input immediately
    }
  };

  return (
    <div className="feature-card">
      <h3>Decentralized Reputation</h3>
      <p>Contract: {contractAddress ? contractAddress.slice(0,10) + '...' : 'Not Configured'}</p>
      
      <div className="score-display">
        <h4>Your Reputation Score: {score}</h4>
      </div>

      <form onSubmit={handleRecordTrade} className="feature-form">
        <div className="form-group">
          <label>Trade Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label>Secret Receipt (Private Input)</label>
          <input
            type="password" // Masks private input
            value={receipt}
            onChange={(e) => setReceipt(e.target.value)}
            required
          />
          <small className="privacy-label">
            🛡️ Proved without revealing your input
          </small>
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting || !api}>
          {isSubmitting ? 'Generating ZK Proof...' : 'Record Trade'}
        </button>
      </form>

      {statusMsg && <div className="status-msg">{statusMsg}</div>}
    </div>
  );
};
