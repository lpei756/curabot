import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // Simulates a browser environment
    globals: true,        // Allows using global test functions like describe and it
    setupFiles: './src/setupTests.js',  // Path to setup file, if needed
    transformMode: {
      web: [/.[tj]sx?/],  // Ensure that it transforms .js, .jsx, .ts, and .tsx
    },
  },
});