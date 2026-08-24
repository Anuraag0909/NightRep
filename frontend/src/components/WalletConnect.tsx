import React from 'react';
import { motion } from 'framer-motion';
import { useMidnight } from '../hooks/useMidnight';

export const WalletConnect: React.FC<{
  onConnect?: (providers: any, api: any, address: string) => void;
}> = ({ onConnect }) => {
  const { providers, api, address, error, isConnecting, connect, disconnect } = useMidnight();

  React.useEffect(() => {
    if (providers && api && address && onConnect) {
      onConnect(providers, api, address);
    }
  }, [providers, api, address, onConnect]);

  const [availableWallets, setAvailableWallets] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).midnight) {
      setAvailableWallets(Object.keys((window as any).midnight));
    }
  }, []);

  if (!api) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
        <div className="wallet-connect-options" style={{ display: 'flex', gap: '10px' }}>
          {availableWallets.length > 0 ? (
            availableWallets.map(walletId => (
              <motion.button 
                key={walletId}
                className="btn-outline header-btn" 
                onClick={() => connect(walletId)} 
                disabled={isConnecting}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              >
                {isConnecting ? 'Connecting...' : `Connect ${walletId === '1am' ? '1AM' : (walletId === 'lace' || walletId.length > 20) ? 'Lace' : walletId.substring(0, 8)}`}
              </motion.button>
            ))
          ) : (
            <span style={{ fontSize: '14px', color: '#888' }}>No Midnight wallets found. Please install an extension.</span>
          )}
        </div>
        {error && <div style={{ color: '#ff4d4f', fontSize: '12px', maxWidth: '250px', textAlign: 'right' }}>{error}</div>}
      </div>
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
