import { useState } from 'react';

import { WalletConnect } from './components/WalletConnect';
import { ReputationFeature } from './components/ReputationFeature';
import './App.css';

function App() {
  const [api, setApi] = useState<any | null>(null);
  const [address, setAddress] = useState<string>('');

  const handleConnect = (connectedApi: any, connectedAddress: string) => {
    setApi(connectedApi);
    setAddress(connectedAddress);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Night Reputation System</h1>
        <WalletConnect onConnect={handleConnect} />
      </header>

      <main>
        {api ? (
          <ReputationFeature api={api} address={address} />
        ) : (
          <div className="hero">
            <h2>Welcome to the Reputation System</h2>
            <p>Please connect your Midnight Lace wallet to view your score and record trades.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
