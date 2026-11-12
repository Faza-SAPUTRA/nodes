import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Server dev meneruskan panggilan /api dan /uploads ke backend FastAPI
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:8010',
      '/uploads': 'http://127.0.0.1:8010',
    },
  },
  build: { outDir: 'dist', sourcemap: false },
});
