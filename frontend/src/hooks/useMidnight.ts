import { useState } from 'react';

export function useMidnight() {
  const [api, setApi] = useState<any | null>(null);
  const [address, setAddress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = async () => {
    setIsConnecting(true);
    setError('');
    try {
      if (!(window as any).midnight || !(window as any).midnight.mnLace) {
        throw new Error('Midnight Lace wallet not found. Please install the extension.');
      }

      const connector = await (window as any).midnight.mnLace.enable();
      setApi(connector);

      // Read unshielded address
      const state = await connector.state();
      setAddress(state.address);

      // Listen for network/account changes if supported
      if (connector.state$) {
        connector.state$.subscribe((newState: any) => {
          setAddress(newState.address);
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Midnight wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setApi(null);
    setAddress('');
  };

  return {
    api,
    address,
    error,
    isConnecting,
    connect,
    disconnect
  };
}
