import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-ignore
import wasm from 'vite-plugin-wasm'
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // @ts-ignore
    wasm(),
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
    }
  }
})
