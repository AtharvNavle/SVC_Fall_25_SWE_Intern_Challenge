import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    name: 'backend',
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage/backend',
      include: ['server/**/*.ts'],
      exclude: [
        'server/**/*.test.ts',
        'server/**/*.spec.ts',
        'server/node-build.ts',
      ],
      all: true,
      thresholds: {
        global: {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100,
        },
      },
    },
    setupFiles: ['./tests/setup-backend.ts'],
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, './shared'),
      '@server': resolve(__dirname, './server'),
    },
  },
});
