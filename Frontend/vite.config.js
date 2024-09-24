import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    plugins: [react()],
    server: {
      port: 5173
    },
    envPrefix: 'VITE_',
    define: {
      'process.env': env,
    },
    build: {
      outDir: 'dist/user',
    },
  });
};
