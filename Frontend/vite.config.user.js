/* global process */
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default ({ mode }) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd(), '')};

  return defineConfig({
    plugins: [react()],
    server: {
      port: 5173
    },
    envPrefix: 'VITE_',
  });
};
