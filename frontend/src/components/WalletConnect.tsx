import React from 'react';
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
      <button className="btn-outline header-btn" onClick={connect} disabled={isConnecting}>
        {isConnecting ? 'Connecting...' : 'Get Started'}
      </button>
    );
  }

  return (
    <div className="connected-wallet">
      <span className="address">{address.slice(0, 6)}...{address.slice(-4)}</span>
      <button className="btn-outline header-btn sm" onClick={disconnect}>Disconnect</button>
    </div>
  );
};
