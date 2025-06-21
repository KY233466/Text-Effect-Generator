import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFile, mkdir } from 'fs/promises';

const projectRoot = __dirname;

// https://vitejs.dev/config/
export default defineConfig({
  // 1. Set the project root to the UI folder
  root: resolve(projectRoot, 'src/ui'),
  
  // 2. Explicitly set the public directory to the project's public folder
  publicDir: resolve(projectRoot, 'public'),

  plugins: [
    react(),
    // 3. Custom plugin to copy manifest and sandbox code
    {
      name: 'adobe-express-addon-build',
      async closeBundle() {
        const buildDir = resolve(projectRoot, 'dist');
        // Ensure the root dist directory exists
        await mkdir(buildDir, { recursive: true });
        // Copy manifest.json
        await copyFile(
          resolve(projectRoot, 'src', 'manifest.json'), 
          resolve(buildDir, 'manifest.json')
        );
        // Copy sandbox code
        const sandboxDir = resolve(buildDir, 'sandbox');
        await mkdir(sandboxDir, { recursive: true });
        await copyFile(
          resolve(projectRoot, 'src', 'sandbox', 'code.js'), 
          resolve(sandboxDir, 'code.js')
        );
        console.log('✅ Manifest and Sandbox copied successfully.');
      }
    }
  ],

  // 4. Set the base to './' to ensure relative paths
  base: './',

  build: {
    // 5. Set the output directory relative to the project root
    outDir: resolve(projectRoot, 'dist/ui'),
    emptyOutDir: true,
    // rollupOptions: {
    //   input: resolve(__dirname, 'src/ui/index.html'),
    //   output: {
    //     entryFileNames: `assets/[name].js`,
    //     chunkFileNames: `assets/[name].js`,
    //     assetFileNames: `assets/[name].[ext]`
    //   }
    // }
  },

  server: {
    port: 3000,
    open: true
  }
}) 