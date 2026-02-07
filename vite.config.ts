import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file from current directory
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // We use a fallback empty string so the app doesn't crash on Netlify
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || '')
    },
    resolve: {
      alias: {
        // Updated from '.' to './src' to match standard React structures
        '@': path.resolve(__dirname, './src'),
      }
    },
    // Ensures the build output goes to the folder Netlify expects
    build: {
      outDir: 'dist',
    }
  };
});
