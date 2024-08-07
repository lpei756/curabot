import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Ensure this matches your expected port
  },
  envPrefix: 'VITE_', // Add this line
});