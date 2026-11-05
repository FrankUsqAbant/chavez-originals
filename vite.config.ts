import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';

/**
 * El panel de administración es una página aparte (admin.html). En desarrollo y en la vista previa, /admin
 * sirve ese archivo; los hosts estáticos lo hacen solos (en Vercel, con "cleanUrls": ver vercel.json).
 */
const adminRoute = (): Plugin => {
  const rewrite = (req: { url?: string }) => {
    if (req.url && /^\/admin\/?(\?.*)?$/.test(req.url)) req.url = '/admin.html';
  };
  return {
    name: 'admin-route',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewrite(req);
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewrite(req);
        next();
      });
    },
  };
};

export default defineConfig({
  plugins: [react(), tailwindcss(), adminRoute()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(import.meta.dirname, 'index.html'),
        admin: path.resolve(import.meta.dirname, 'admin.html'),
      },
    },
  },
});
