import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';

// Helper to copy directory recursively
function copyDir(src: string, dest: string) {
  if (!existsSync(src)) return;
  mkdirSync(dest, { recursive: true });
  for (const file of readdirSync(src)) {
    const srcPath = resolve(src, file);
    const destPath = resolve(dest, file);
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

export default defineConfig({
  root: '.',
  base: '/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
    copyPublicDir: true,
  },
  plugins: [
    {
      name: 'copy-assets',
      closeBundle() {
        // Copy assets folder
        copyDir('assets', 'dist/assets');
        // Copy config.js
        if (existsSync('config.js')) {
          copyFileSync('config.js', 'dist/config.js');
        }
        // Copy service-worker.js
        if (existsSync('service-worker.js')) {
          copyFileSync('service-worker.js', 'dist/service-worker.js');
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
