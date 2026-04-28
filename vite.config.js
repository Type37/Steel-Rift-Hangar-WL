import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import {BootstrapVueNextResolver} from 'bootstrap-vue-next';
import vueDevTools from 'vite-plugin-vue-devtools';
import path from 'path';
import vitePluginSvgsIcons from 'vite-plugin-svgs-icons';

export default defineConfig({
    base: '/Steel-Rift-Hangar-WL/',
    build: {
        outDir: 'dist',
    },
    plugins: [
        vitePluginSvgsIcons({
            dir: path.resolve(__dirname, 'public', 'icons'),
        }),
        vue(),
        vueDevTools(),
        Components({
            dts: false,
            resolvers: [BootstrapVueNextResolver()],
        }),
    ],
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler',
                importers: [
                    // ...
                ],
            },
        },
    },
});