import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // This ensures process.env.API_KEY is available in the client-side code
      // configured in Vercel Project Settings.
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});