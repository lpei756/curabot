/* global process */
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default ({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return defineConfig({
        plugins: [react()],
        server: {
            port: 5174 // 管理员端口
        },
        envPrefix: 'VITE_',
        define: {
            'process.env': env,
        },
        build: {
            outDir: 'dist/admin', // 输出目录为 dist/admin
        },
    });
};
