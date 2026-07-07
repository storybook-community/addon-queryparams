import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:6006/iframe.html?id=example-params--playground&viewMode=story',
      },
    },
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
