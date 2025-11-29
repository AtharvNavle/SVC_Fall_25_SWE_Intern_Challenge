import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'frontend',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./client/vitest.setup.ts'],
    include: ['client/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      'node_modules/**',
      'dist/**',
      'tests/**', // Exclude backend tests
      'server/**', // Exclude server code
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage/frontend',
      include: ['client/**/*.{ts,tsx}'],
      exclude: [
        'client/**/*.test.{ts,tsx}',
        'client/**/*.spec.{ts,tsx}',
        'client/vite-env.d.ts',
        'client/**/ui/**', // Exclude UI component library (third-party)
        'tests/**',
        'server/**',
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
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
});

