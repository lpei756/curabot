import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  envPrefix: 'VITE_',
  build: {
    outDir: 'dist', // 确保 Vite 将构建输出到 dist 文件夹
  }
});
