/* global process */
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default ({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return defineConfig({
        plugins: [react()],
        server: {
            port: 5174
        },
        envPrefix: 'VITE_',
        define: {
            'process.env': env,
        },
        build: {
            outDir: 'dist/admin',
        },
    });
};
