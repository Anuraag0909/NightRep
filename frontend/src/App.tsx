import { useState } from 'react';
import { WalletConnect } from './components/WalletConnect';
import { ReputationFeature } from './components/ReputationFeature';
import './App.css';

function App() {
  const [providers, setProviders] = useState<any | null>(null);
  const [api, setApi] = useState<any | null>(null);
  const [address, setAddress] = useState<string>('');

  const handleConnect = (connectedProviders: any, connectedApi: any, connectedAddress: string) => {
    setProviders(connectedProviders);
    setApi(connectedApi);
    setAddress(connectedAddress);
  };

  return (
    <div className="app-wrapper">
      <nav className="navbar">
        <div className="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
          NightRep
        </div>
        <div className="nav-actions">
          <WalletConnect onConnect={handleConnect} />
        </div>
      </nav>

      <main className="main-content">
        <div className="hero-section">
          <h1 className="hero-title">
            Elevate Your Reputation<br/>with NightRep
          </h1>
          <p className="hero-subtitle">
            Empowering Your Success with Cutting-Edge ZK Solutions Built for<br/>Scalability, Efficiency, and Trust.
          </p>
          <div className="hero-actions">
            {!api ? (
              <a href="#" className="btn-solid hero-btn">
                Get Started ↗
              </a>
            ) : (
              <a href="#" className="btn-solid hero-btn">
                Dashboard Active ↗
              </a>
            )}
          </div>
        </div>

        <div className="dashboard-mockup">
          <div className="mockup-header">
            <div className="window-controls">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
          </div>
          <div className="mockup-body">
             <div className="mockup-content">
               {api ? (
                 <ReputationFeature providers={providers} address={address} />
               ) : (
                 <div className="mockup-placeholder">
                   <div className="placeholder-header">
                     <div className="title-area">
                       <h2>Welcome to your NightRep Dashboard</h2>
                       <p>Experience and Maximize the Benefits of NightRep's<br/>Innovative Features</p>
                     </div>
                   </div>
                   <div className="placeholder-grid">
                     <div className="card-mock"></div>
                     <div className="card-mock-right"></div>
                   </div>
                 </div>
               )}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
