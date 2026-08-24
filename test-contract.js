import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { Contract } from './contracts/managed/reputation/contract.js';

const INDEXER_URL = 'https://indexer.preview.midnight.network/api/v4/graphql';
const INDEXER_WS_URL = 'wss://indexer.preview.midnight.network/api/v4/graphql/ws';
const CONTRACT_ADDRESS = 'f2776a7cd0a51aaeadc7b04aa921ef5dc49516f699707cf746ffec8682b608b9';

async function main() {
  console.log('Connecting to indexer...', INDEXER_URL);
  const publicDataProvider = indexerPublicDataProvider(INDEXER_URL, INDEXER_WS_URL);
  
  try {
    console.log('Finding contract...', CONTRACT_ADDRESS);
    const contract = await findDeployedContract(publicDataProvider, {
      contractAddress: CONTRACT_ADDRESS,
      contractReference: Contract,
    });
    console.log('Contract found!');
    
    // Check state
    // We cannot read maps without keys easily, but we can check if it loaded.
    console.log('Contract successfully instantiated.');
  } catch (e) {
    console.error('Failed to find contract:', e);
  }
}

main().catch(console.error);
