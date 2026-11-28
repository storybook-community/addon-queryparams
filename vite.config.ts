import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          environmentOptions: {
            jsdom: {
              url: 'http://localhost:6006/iframe.html?id=example-params--playground&viewMode=story',
            },
          },
          include: ['src/**/*.test.{ts,tsx}'],
        },
      },
      {
        extends: true,
        // Runs every story, including its `play` function, as a test in a real browser. The
        // stories load the addon from `dist/`, so build before running them (`pnpm test` does).
        plugins: [storybookTest({ storybookScript: 'pnpm storybook --ci' })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
