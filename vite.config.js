import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // If running in GitHub Actions CI, GITHUB_REPOSITORY is automatically provided (e.g. "tran-thanh24/pulse-live" or "tran-thanh24/Concert")
  // Or VITE_BASE_PATH can be passed explicitly
  const repoName = process.env.GITHUB_REPOSITORY
    ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
    : './';
  const base = process.env.VITE_BASE_PATH || repoName;

  return {
    plugins: [react()],
    base,
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            'three-core': ['three'],
            'ui-icons': ['lucide-react']
          }
        }
      }
    }
  };
});
