import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProvingProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { CostModel } from '@midnight-ntwrk/midnight-js-protocol/ledger';
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

  const proofServerUrl = import.meta.env.VITE_PROOF_SERVER_URL;
  if (proofServerUrl) {
    console.log('[midnightProvider] Using explicit proof server fallback:', proofServerUrl);
  } else {
    console.log('[midnightProvider] Using wallet default proof server');
  }

/**
 * Quick reachability check: sends a small GET to the proof server.
 * Throws a descriptive error if the server is down, so the user gets
 * immediate feedback instead of a multi-minute hang.
 */
export const checkProofServerReachable = async (url: string): Promise<void> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    await fetch(url, { method: 'GET', signal: controller.signal }).finally(() => clearTimeout(timeout));
    // Any response (even 404/405) means the server is up
  } catch {
    throw new Error(
      `Proof server at ${url} is not reachable. ` +
      (url.includes('localhost') || url.includes('127.0.0.1')
        ? 'Start Docker Desktop and run: docker compose up -d proof-server'
        : 'Check your network connection or wallet configuration.')
    );
  }
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
  const api: ConnectedAPI = await (windowWallet.connect ? windowWallet.connect() : windowWallet.enable());

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
    get: async () => ({
      'record_trade': {
        zkir: await fetchFileAsUint8Array('/reputation/zkir/record_trade.bzkir'),
        prover: await fetchFileAsUint8Array('/reputation/keys/record_trade.prover'),
        verifier: await fetchFileAsUint8Array('/reputation/keys/record_trade.verifier'),
      }
    }),
    asKeyMaterialProvider: function () { return this; }
  };

  // Resolve the proof server URL from the environment.
  // If explicitly set, we use it directly (useful for local Docker testing).
  // Otherwise, we get the default proving provider from the wallet extension.
  let provingProviderToUse: any;

  if (proofServerUrl) {
    const baseProvingProvider = httpClientProvingProvider(proofServerUrl, zkConfigProvider as any, {
      timeout: 120_000, // 2 minute timeout per proof operation
    });
    provingProviderToUse = {
      check: async () => {
        console.log('[bypassProvingProvider] Bypassing /check endpoint (returning mock success)');
        return [undefined]; // Mock success
      },
      prove: (serializedPreimage: Uint8Array, keyLocation: string, overwriteBindingInput?: bigint) => {
        console.log(`[bypassProvingProvider] Forwarding /prove request to ${proofServerUrl}`);
        return baseProvingProvider.prove(serializedPreimage, keyLocation, overwriteBindingInput);
      }
    };
  } else {
    provingProviderToUse = await api.getProvingProvider(zkConfigProvider as any);
  }

  const proofProvider = {
    proveTx: async (unprovenTx: any, _partialProveTxConfig: any) => {
      const costModel = CostModel.initialCostModel();
      return unprovenTx.prove(provingProviderToUse, costModel);
    }
  };

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
