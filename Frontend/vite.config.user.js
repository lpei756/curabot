import { defineConfig, loadEnv } from 'vite';
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
      'process.env': env,  // 通过 define 注入全局的环境变量
    },
  });
};
