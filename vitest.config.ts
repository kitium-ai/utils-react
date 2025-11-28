/**
 * Vitest Configuration for @kitiumai/utils-react
 * Using latest @kitiumai/vitest-helpers 2.0 APIs with React support
 */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { createKitiumVitestConfig } from '@kitiumai/vitest-helpers/config';

export default defineConfig(
  createKitiumVitestConfig({
    preset: 'library',
    projectName: '@kitiumai/utils-react',
    environment: 'jsdom', // React requires jsdom environment
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        '**/*.test.tsx',
        '**/*.test.ts',
        '**/*.spec.tsx',
        '**/*.spec.ts',
        '**/index.ts',
        '**/index.tsx',
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
    },
    overrides: {
      plugins: [react()],
      test: {
        // Setup files for React Testing Library
        setupFiles: ['./tests/setup.ts'],
        // Include test files
        include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
      },
    },
  })
);

