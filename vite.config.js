import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [vue()],
  root: resolve(__dirname, 'apps/web'),
  envDir: __dirname,
  resolve: {
    alias: {
      '@': resolve(__dirname, 'apps/web/src')
    }
  },
  build: {
    outDir: resolve(__dirname, 'apps/web/dist'),
    emptyOutDir: true
  },
  server: {
    port: 5173
  }
});
