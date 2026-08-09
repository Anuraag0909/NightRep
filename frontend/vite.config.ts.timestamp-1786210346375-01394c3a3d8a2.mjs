// vite.config.ts
import { defineConfig } from "file:///C:/Users/anura/OneDrive/Desktop/midnightanti/reputation-system/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/anura/OneDrive/Desktop/midnightanti/reputation-system/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import wasm from "file:///C:/Users/anura/OneDrive/Desktop/midnightanti/reputation-system/frontend/node_modules/vite-plugin-wasm/exports/import.mjs";
import path from "path";
import { nodePolyfills } from "file:///C:/Users/anura/OneDrive/Desktop/midnightanti/reputation-system/frontend/node_modules/vite-plugin-node-polyfills/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\anura\\OneDrive\\Desktop\\midnightanti\\reputation-system\\frontend";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    // @ts-ignore
    wasm(),
    // Top-level await is natively supported in ESNext, plugin removed to fix build error
    nodePolyfills({
      include: ["events", "buffer", "stream", "util"],
      globals: {
        Buffer: true,
        global: true,
        process: true
      }
    })
  ],
  build: {
    target: "esnext"
  },
  resolve: {
    alias: {
      "isomorphic-ws": path.resolve(__vite_injected_original_dirname, "isomorphic-ws-shim.js")
    },
    dedupe: ["@midnight-ntwrk/compact-runtime", "@midnight-ntwrk/onchain-runtime-v3"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxhbnVyYVxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXG1pZG5pZ2h0YW50aVxcXFxyZXB1dGF0aW9uLXN5c3RlbVxcXFxmcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcYW51cmFcXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxtaWRuaWdodGFudGlcXFxccmVwdXRhdGlvbi1zeXN0ZW1cXFxcZnJvbnRlbmRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2FudXJhL09uZURyaXZlL0Rlc2t0b3AvbWlkbmlnaHRhbnRpL3JlcHV0YXRpb24tc3lzdGVtL2Zyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCB3YXNtIGZyb20gJ3ZpdGUtcGx1Z2luLXdhc20nXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IG5vZGVQb2x5ZmlsbHMgfSBmcm9tICd2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxscydcblxuLy8gaHR0cHM6Ly92aXRlLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgd2FzbSgpLFxuICAgIC8vIFRvcC1sZXZlbCBhd2FpdCBpcyBuYXRpdmVseSBzdXBwb3J0ZWQgaW4gRVNOZXh0LCBwbHVnaW4gcmVtb3ZlZCB0byBmaXggYnVpbGQgZXJyb3JcbiAgICBub2RlUG9seWZpbGxzKHtcbiAgICAgIGluY2x1ZGU6IFsnZXZlbnRzJywgJ2J1ZmZlcicsICdzdHJlYW0nLCAndXRpbCddLFxuICAgICAgZ2xvYmFsczoge1xuICAgICAgICBCdWZmZXI6IHRydWUsXG4gICAgICAgIGdsb2JhbDogdHJ1ZSxcbiAgICAgICAgcHJvY2VzczogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSlcbiAgXSxcbiAgYnVpbGQ6IHtcbiAgICB0YXJnZXQ6ICdlc25leHQnXG4gIH0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ2lzb21vcnBoaWMtd3MnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnaXNvbW9ycGhpYy13cy1zaGltLmpzJylcbiAgICB9LFxuICAgIGRlZHVwZTogWydAbWlkbmlnaHQtbnR3cmsvY29tcGFjdC1ydW50aW1lJywgJ0BtaWRuaWdodC1udHdyay9vbmNoYWluLXJ1bnRpbWUtdjMnXVxuICB9XG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF1WixTQUFTLG9CQUFvQjtBQUNwYixPQUFPLFdBQVc7QUFFbEIsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHFCQUFxQjtBQUw5QixJQUFNLG1DQUFtQztBQVF6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUE7QUFBQSxJQUVOLEtBQUs7QUFBQTtBQUFBLElBRUwsY0FBYztBQUFBLE1BQ1osU0FBUyxDQUFDLFVBQVUsVUFBVSxVQUFVLE1BQU07QUFBQSxNQUM5QyxTQUFTO0FBQUEsUUFDUCxRQUFRO0FBQUEsUUFDUixRQUFRO0FBQUEsUUFDUixTQUFTO0FBQUEsTUFDWDtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxFQUNWO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxpQkFBaUIsS0FBSyxRQUFRLGtDQUFXLHVCQUF1QjtBQUFBLElBQ2xFO0FBQUEsSUFDQSxRQUFRLENBQUMsbUNBQW1DLG9DQUFvQztBQUFBLEVBQ2xGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
