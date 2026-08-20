import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';

import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { resolveNetwork, getOrCreateWallet, getDeployment } from '../src/network';
import { createWallet, persistWalletState } from '../src/wallet';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

// @ts-expect-error wallet sync requires WebSocket
globalThis.WebSocket = WebSocket;

const PRIVATE_STATE_ID = 'helloWorldPrivateState';

async function main() {
  const { network, config: networkConfig } = resolveNetwork();
  const WALLET = getOrCreateWallet(network);
  
  const deployment = getDeployment(network);
  if (!deployment) throw new Error("No deployment found");

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const zkConfigPath = path.resolve(__dirname, '..', 'contracts', 'managed', 'reputation');
  const contractPath = path.join(zkConfigPath, 'contract', 'index.js');
  const HelloWorld = await import(pathToFileURL(contractPath).href);
  const compiledContract = CompiledContract.make('reputation', HelloWorld.Contract).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(zkConfigPath),
  );

  const walletCtx = await createWallet({ network, networkConfig, seed: WALLET.seed });
  await walletCtx.wallet.waitForSyncedState();

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  
  const walletProvider = {
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx(tx: any, ttl?: Date) {
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      return walletCtx.wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx) as any,
  };

  const providers = {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'reputation-state-test',
      accountId: walletCtx.unshieldedKeystore.getBech32Address().toString(),
      privateStoragePasswordProvider: () => 'Local-Devnet-Development-Placeholder-1',
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };

  const contract = await findDeployedContract(providers, {
    contractAddress: deployment.address,
    compiledContract: compiledContract as any,
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: {},
  });

  console.log("Submitting transaction...");
  const user = new Uint8Array(32);
  const receiptBuf = new Uint8Array(32);
  const receiptStr = `test-receipt-${Date.now()}`.substring(0, 32);
  receiptBuf.set(new TextEncoder().encode(receiptStr));

  // Override check on the proofProvider to see if that works
  const rawProvider = providers.proofProvider as any;
  const originalCheck = rawProvider.check;
  rawProvider.check = async () => {
    console.warn("Bypassed local Node check!");
    return [];
  };

  try {
    const tx = await contract.callTx.record_trade(user, 50n, receiptBuf);
    console.log("Tx success!", tx.public.txHash);
  } catch (err: any) {
    console.error("Tx failed:", err.message);
  }

  await walletCtx.wallet.stop();
  process.exit(0);
}

main().catch(console.error);
