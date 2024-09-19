/* global process */
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    plugins: [react()],
    server: {
      port: 5175, // 不同的端口用于超级管理员
    },
    envPrefix: 'VITE_',
    define: {
      'process.env': env,
    },
    build: {
      outDir: 'dist/superadmin', // 构建输出目录为 superadmin 文件夹
    },
  });
};
