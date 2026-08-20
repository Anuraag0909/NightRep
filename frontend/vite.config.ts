import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-ignore
import wasm from 'vite-plugin-wasm'
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills'

/**
 * Vite plugin that intercepts the Midnight SDK's /check requests at the
 * HTTP server level. The SDK 4.1.x httpClientProofProvider sends an
 * incompatible payload to the proof-server's /check endpoint, causing a
 * 400 Bad Request. This plugin short-circuits /check with a 200 OK
 * so the SDK proceeds directly to /prove.
 *
 * Only used when the proof server URL resolves to localhost (Docker fallback).
 */
function proofServerCheckBypass(): Plugin {
  return {
    name: 'proof-server-check-bypass',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/check' || req.url?.startsWith('/check?')) {
          console.log('[proof-server-check-bypass] Intercepted /check → returning mock success');
          const header = Buffer.from('midnight:vec(option(u64)):');
          const body = Buffer.concat([header, Buffer.from([0x00])]);
          res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
          res.end(body);
          return;
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // @ts-ignore
    wasm(),
    proofServerCheckBypass(),
    // Top-level await is natively supported in ESNext, plugin removed to fix build error
    nodePolyfills({
      include: ['events', 'buffer', 'stream', 'util'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    })
  ],
  build: {
    target: 'esnext'
  },
  resolve: {
    alias: {
      'isomorphic-ws': path.resolve(__dirname, 'isomorphic-ws-shim.js')
    },
    dedupe: ['@midnight-ntwrk/compact-runtime', '@midnight-ntwrk/onchain-runtime-v3']
  },
  server: {
    fs: {
      allow: [
        // Allow serving files from the project root (parent of frontend/)
        path.resolve(__dirname, '..'),
      ]
    },
    proxy: {
      // Forward /prove requests to the local Docker proof server.
      // Only used when the wallet doesn't provide a hosted proverServerUri
      // and the fallback resolves to localhost via Vite's dev proxy.
      '/prove': {
        target: 'http://localhost:6300',
        changeOrigin: true,
      }
    }
  }
})
