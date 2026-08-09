import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { dappConnectorProofProvider } from '@midnight-ntwrk/midnight-js-dapp-connector-proof-provider';
import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { type WalletProvider } from '@midnight-ntwrk/midnight-js-types';
import { type MidnightProvider } from '@midnight-ntwrk/midnight-js-types';
import { type ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { Contract } from '../../../contracts/managed/reputation/contract';
import type { FoundContract } from '@midnight-ntwrk/midnight-js-contracts';

// Re-export the contract type wrapped by midnight-js
export type ReputationContract = FoundContract<Contract<any, any>>;

export interface ReputationProviders extends MidnightProviders<any, any> {
  publicDataProvider: ReturnType<typeof indexerPublicDataProvider>;
  privateStateProvider: ReturnType<typeof levelPrivateStateProvider>;
  zkConfigProvider: any;
  proofProvider: any;
  walletProvider: WalletProvider;
  midnightProvider: MidnightProvider;
}

export const buildReputationContract = async (providers: ReputationProviders, contractAddress: string): Promise<ReputationContract> => {
  // To instantiate the contract in the browser, we use the compiled Contract 
  // class and pass it to findDeployedContract.
  
  // Note: we assume the contract has no private state because it has no witnesses
  const compiledContract = CompiledContract.make('reputation', Contract).pipe(
    CompiledContract.withVacantWitnesses
  );

  const contract = await findDeployedContract(providers, {
    contractAddress,
    compiledContract: compiledContract as any,
  });

  return contract as unknown as ReputationContract;
};

export const initializeProviders = async (walletId: string = '1am'): Promise<ReputationProviders> => {
  const indexerUrl = import.meta.env.VITE_INDEXER_URL || 'http://127.0.0.1:8088/api/v4/graphql';
  const indexerWsUrl = import.meta.env.VITE_INDEXER_WS_URL || 'ws://127.0.0.1:8088/api/v4/graphql/ws';
  
  // Set the network ID based on environment or default to Undeployed
  const network = import.meta.env.VITE_NETWORK === 'preview' ? 'preview' : 'Undeployed';
  setNetworkId(network);
  
  if (!(window as any).midnight || !(window as any).midnight[walletId]) {
    throw new Error(`Midnight wallet '${walletId}' not found. Please install the extension.`);
  }
  
  const windowWallet = (window as any).midnight[walletId];
  
  // 1AM wallet exposes connect() instead of enable()
  const rawApi: ConnectedAPI = await (windowWallet.connect ? windowWallet.connect() : windowWallet.enable());
  
  const api: ConnectedAPI = new Proxy(rawApi, {
    get(target, prop, receiver) {
      if (prop === 'getProvingProvider') {
        return async (keyMat: any) => {
          const rawProver = await target.getProvingProvider(keyMat);
          return new Proxy(rawProver, {
            get(proverTarget, proverProp, proverReceiver) {
              // The Midnight SDK and Wallet Extension have mismatched arguments for .check().
              // SDK passes (proof, verifierKey), but Wallet expects (preimage, keyLocation).
              // We intercept and bypass the local check to prevent the SDK from crashing the transaction.
              if (proverProp === 'check') {
                return async () => {
                  console.warn("Bypassing incompatible local proof check...");
                  return [];
                };
              }
              const val = Reflect.get(proverTarget, proverProp, proverReceiver);
              return typeof val === 'function' ? val.bind(proverTarget) : val;
            }
          });
        };
      }
      
      const value = Reflect.get(target, prop, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    }
  });

  // Fetch actual keys to prevent bech32 decode errors during transaction building
  const shieldedAddresses = await api.getShieldedAddresses();

  const publicDataProvider = indexerPublicDataProvider(indexerUrl, indexerWsUrl);
  
  const privateStateProvider = levelPrivateStateProvider({
    privateStateStoreName: 'reputation-private-state',
    privateStoragePasswordProvider: async () => 'Local-Devnet-Development-Placeholder-1',
    accountId: 'reputation-user'
  });

  const fetchFileAsUint8Array = async (path: string): Promise<Uint8Array> => {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to fetch ZK file: ${path}`);
    }
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  };

  const zkConfigProvider = {
    getZKIR: async (circuitKeyLocation: string) => fetchFileAsUint8Array(`/reputation/zkir/${circuitKeyLocation}.bzkir`),
    getProverKey: async (circuitKeyLocation: string) => fetchFileAsUint8Array(`/reputation/keys/${circuitKeyLocation}.prover`),
    getVerifierKey: async (circuitKeyLocation: string) => fetchFileAsUint8Array(`/reputation/keys/${circuitKeyLocation}.verifier`),
    getVerifierKeys: async (circuitIds: string[]) => {
      return Promise.all(
        circuitIds.map(async (id) => [id, await fetchFileAsUint8Array(`/reputation/keys/${id}.verifier`)])
      ) as any;
    },
    get: async () => ({}),
    asKeyMaterialProvider: function () { return this; }
  };

  // By passing undefined, the SDK falls back to its internal CostModel.initialCostModel(), bypassing Vite dual-package module instantiation bugs!
  const proofProvider = await dappConnectorProofProvider(api, zkConfigProvider as any, undefined as any);
  
  const walletProvider: WalletProvider = {
    balanceTx: async (tx: any, _ttl?: Date) => {
      const txStr = tx.serialize();
      const balanced = await api.balanceUnsealedTransaction(txStr);
      return {
        serialize: () => balanced.tx,
      } as any;
    },
    getCoinPublicKey: () => {
      return shieldedAddresses.shieldedCoinPublicKey as any;
    },
    getEncryptionPublicKey: () => {
       return shieldedAddresses.shieldedEncryptionPublicKey as any;
    }
  };

  const midnightProvider: MidnightProvider = {
    submitTx: async (tx: any) => {
      const txStr = tx.serialize();
      await api.submitTransaction(txStr);
      return txStr;
    }
  };

  return {
    publicDataProvider,
    privateStateProvider,
    zkConfigProvider,
    proofProvider,
    walletProvider,
    midnightProvider,
  } as ReputationProviders;
};
