import { Buffer } from 'buffer';
import { resolveNetwork, getOrCreateWallet, getDeployment } from './network';
import { createWallet, unshieldedToken } from './wallet';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';

// Required for wallet sync
// @ts-expect-error globalThis typing
globalThis.WebSocket = WebSocket;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zkConfigPath = path.resolve(__dirname, '..', 'contracts', 'managed', 'reputation');
const contractPath = path.join(zkConfigPath, 'contract', 'index.js');
const HelloWorld = await import(pathToFileURL(contractPath).href);
const compiledContract = CompiledContract.make('reputation', HelloWorld.Contract).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets(zkConfigPath),
);

// resolveNetwork takes an options object, not a plain string.
// Pass --network preview via argv so the resolver picks it up correctly.
const { network, config: networkConfig } = resolveNetwork({
  argv: ['node', 'test-call.ts', '--network', 'preview'],
});
const WALLET = getOrCreateWallet(network);
const deployment = getDeployment(network);

if (!deployment) {
  console.error('No deployment found. Run `npm run deploy -- --network preview` first.');
  process.exit(1);
}

console.log(`Network: ${network}`);
console.log(`Contract address: ${deployment.address}`);

const walletCtx = await createWallet({ network, networkConfig, seed: WALLET.seed });
console.log('Syncing wallet...');
await walletCtx.wallet.waitForSyncedState();
console.log('Wallet synced.');

const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
const walletProvider = {
  getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
  getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
  balanceTx: async (tx: any, ttl?: Date) => {
    const recipe = await walletCtx.wallet.balanceUnboundTransaction(tx, { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey }, { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) });
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

console.log('Finding deployed contract...');
const deployed = await findDeployedContract(providers, {
  compiledContract: compiledContract as any,
  contractAddress: deployment.address,
  privateStateId: 'helloWorldPrivateState',
  initialPrivateState: {},
});
console.log('Contract found. Preparing call...');

// Build a proper 32-byte user identifier
const buf = Buffer.alloc(32);
buf.write('Alice', 0, 'utf8');
const userBytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);

// Build a proper 32-byte receipt
const receiptBuf = Buffer.alloc(32);
receiptBuf.write('test-receipt-001', 0, 'utf8');
const receiptBytes = new Uint8Array(receiptBuf.buffer, receiptBuf.byteOffset, receiptBuf.byteLength);

const amount = 100n;

console.log("Calling record_trade(user, amount, receipt)...");
try {
  const tx = await deployed.callTx.record_trade(userBytes, amount, receiptBytes);
  console.log("✅ Success record_trade!", tx.public.txId);
  console.log("Block height:", tx.public.blockHeight);
} catch (e) {
  console.error("❌ Error record_trade:", e);
}

await walletCtx.wallet.stop();
process.exit(0);
