import { useState } from 'react';
import { initializeProviders } from '../utils/midnightProvider';
import type { ReputationProviders } from '../utils/midnightProvider';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';

export function useMidnight() {
  const [providers, setProviders] = useState<ReputationProviders | null>(null);
  const [api, setApi] = useState<ConnectedAPI | null>(null);
  const [address, setAddress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = async () => {
    setIsConnecting(true);
    setError('');
    try {
      if (!(window as any).midnight || !(window as any).midnight['1am']) {
        throw new Error(`Midnight wallet '1am' not found. Please install the extension.`);
      }
      
      const windowWallet = (window as any).midnight['1am'];
      const connector: ConnectedAPI = await (windowWallet.connect ? windowWallet.connect() : windowWallet.enable());
      
      // Initialize full Midnight JS environment (wallet, indexer, prover, etc.)
      // We pass the connector into a new version of initializeProviders if we adjust it,
      // but for now, initializeProviders also calls enable(). That's fine, it returns the same instance.
      const newProviders = await initializeProviders('1am');
      
      setProviders(newProviders);
      setApi(connector);

      // Try to get the address
      let retrievedAddress = '';

      if (typeof connector.getUnshieldedAddress === 'function') {
        // 1AM Wallet DApp Connector standard
        const unshielded = await connector.getUnshieldedAddress();
        if (typeof unshielded === 'string') {
          retrievedAddress = unshielded;
        } else if (unshielded && typeof unshielded === 'object') {
          if ('unshieldedAddress' in unshielded) {
            retrievedAddress = (unshielded as any).unshieldedAddress;
          } else if ('address' in unshielded) {
            retrievedAddress = (unshielded as any).address;
          } else {
            retrievedAddress = JSON.stringify(unshielded);
          }
        } else {
          retrievedAddress = String(unshielded);
        }
      } else {
        const props = Object.keys(connector).join(', ');
        throw new Error(`Cannot find address getter on connector. Available properties: ${props}`);
      }

      setAddress(retrievedAddress);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Midnight wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setProviders(null);
    setApi(null);
    setAddress('');
  };

  return {
    providers,
    api,
    address,
    error,
    isConnecting,
    connect,
    disconnect
  };
}
