import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        methods: 'methods.html',
        applications: 'applications.html',
        projects: 'projects.html',
        quality-hse: 'quality-hse.html',
        contact: 'contact.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});