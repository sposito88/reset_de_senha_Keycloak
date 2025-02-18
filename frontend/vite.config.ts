import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

console.log("VITE_API_URL no build:", process.env.VITE_API_URL);

export default defineConfig({
  plugins: [react()],
  base: "/reset/",
  define: {
    "import.meta.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL || "http://localhost:3000/api/reset-password"),
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});

