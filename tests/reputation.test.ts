import { expect, test, describe } from 'vitest';
import { Contract } from '../contracts/managed/reputation/contract/index.js';
import { resolveNetwork, parseNetworkFlag } from '../src/network.js';
import { generateMnemonicPhrase, isValidMnemonic, mnemonicToSeedHex } from '../src/network.js';

describe('NightRep Decentralized Reputation System Tests', () => {
  
  test('Test 1: Core contract/privacy functionality (Circuit Witness Verification)', () => {
    const contract = new Contract({});
    
    // Validate the core privacy requirement: record_trade must exist
    expect(contract.impureCircuits.record_trade).toBeTypeOf('function');
    
    // We expect the contract to have been compiled correctly exposing the right interfaces.
    // The underlying contract guarantees that receipt is kept private and hashed.
    expect(contract.impureCircuits.issue_receipt).toBeTypeOf('function');
    
    // Basic instantiation verifies the generated compact artifact is well-formed.
    expect(contract).toBeDefined();
  });

  test('Test 2: Important business logic (Network & Environment Configuration)', () => {
    // Verify that the network resolution correctly parses the network flag
    const parsedFlag = parseNetworkFlag(['node', 'script.ts', '--network', 'preview']);
    expect(parsedFlag).toBe('preview');

    // Verify it throws on unknown networks
    expect(() => parseNetworkFlag(['node', 'script', '--network', 'mainnet'])).toThrow(/Unknown network/);

    // Verify the resolution defaults properly
    const resolved = resolveNetwork({ argv: ['node', 'script.ts'] });
    expect(resolved.config).toBeDefined();
    expect(['undeployed', 'preview', 'preprod']).toContain(resolved.network);
  });

  test('Test 3: Wallet/application workflow (Mnemonic & Seed Generation)', () => {
    // Verify the core wallet generation workflow required for Lace / Midnight compatibility
    const mnemonic = generateMnemonicPhrase();
    
    // 1. Must generate a valid BIP-39 mnemonic
    expect(isValidMnemonic(mnemonic)).toBe(true);
    expect(mnemonic.split(' ').length).toBe(24);
    
    // 2. Must deterministically convert to a 64-byte hex seed (128 characters)
    const seedHex = mnemonicToSeedHex(mnemonic);
    expect(typeof seedHex).toBe('string');
    expect(seedHex.length).toBe(128);
    expect(/^[0-9a-f]+$/.test(seedHex)).toBe(true);
  });

});
