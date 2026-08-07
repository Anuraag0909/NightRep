import React from 'react';
import { useMidnight } from '../hooks/useMidnight';

export const WalletConnect: React.FC<{
  onConnect?: (api: any, address: string) => void;
}> = ({ onConnect }) => {
  const { api, address, error, isConnecting, connect, disconnect } = useMidnight();
  const network = import.meta.env.VITE_NETWORK || 'preview';

  const handleConnect = async () => {
    await connect();
  };

  // When API is ready, you can pass it up via onConnect
  React.useEffect(() => {
    if (api && address && onConnect) {
      onConnect(api, address);
    }
  }, [api, address]);

  return (
    <div className="wallet-connect-card">
      <div className="wallet-header">
        <h3>Wallet Connection</h3>
        <span className="badge network-badge">{network}</span>
      </div>

      {error && <div className="error-alert">{error}</div>}

      {!api ? (
        <button
          className="btn btn-primary"
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect Midnight Wallet'}
        </button>
      ) : (
        <div className="wallet-info">
          <p>
            <strong>Status:</strong> Connected
          </p>
          <p>
            <strong>Address:</strong> {address.slice(0, 10)}...{address.slice(-6)}
          </p>
          <button className="btn btn-secondary" onClick={disconnect}>
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};
