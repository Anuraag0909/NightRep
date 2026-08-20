import React from 'react';
import { motion } from 'framer-motion';
import { useMidnight } from '../hooks/useMidnight';

export const WalletConnect: React.FC<{
  onConnect?: (providers: any, api: any, address: string) => void;
}> = ({ onConnect }) => {
  const { providers, api, address, isConnecting, connect, disconnect } = useMidnight();

  React.useEffect(() => {
    if (providers && api && address && onConnect) {
      onConnect(providers, api, address);
    }
  }, [providers, api, address, onConnect]);

  if (!api) {
    return (
      <motion.button 
        className="btn-outline header-btn" 
        onClick={connect} 
        disabled={isConnecting}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      >
        {isConnecting ? 'Connecting...' : 'Get Started'}
      </motion.button>
    );
  }

  return (
    <div className="connected-wallet">
      <span className="address">{address.slice(0, 6)}...{address.slice(-4)}</span>
      <motion.button 
        className="btn-outline header-btn sm" 
        onClick={disconnect}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      >
        Disconnect
      </motion.button>
    </div>
  );
};
