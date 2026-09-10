import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            // 保持 /api 前缀，直接转发给后端的 /api 接口
            rewrite: (path) => path,
            target: 'http://localhost:8080',
            ws: true,
          },
          '/admin': {
            changeOrigin: true,
            // 保持 /admin 前缀，直接转发给后端的 /admin 接口
            rewrite: (path) => path,
            target: 'http://localhost:8080',
            ws: true,
          },
        },
      },
    },
  };
});
