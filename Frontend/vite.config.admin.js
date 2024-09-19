/* global process */
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    plugins: [react()],
    server: {
      port: 5174, // 不同的端口用于区分不同环境
    },
    envPrefix: 'VITE_',
    define: {
      'process.env': env,
    },
    build: {
      outDir: 'dist/admin', // 构建输出目录为 admin 文件夹
    },
  });
};
