import { defineConfig } from 'vitest/config';
import { createKitiumVitestConfig } from '@kitiumai/vitest-helpers/config';

export default defineConfig(
  createKitiumVitestConfig({
    preset: 'browser',
    setupFiles: ['./tests/setup.ts'],
    projectName: '@kitiumai/utils-react',
    coverage: false,
    overrides: {
      test: {
        // Avoid tinypool recursion issues in this environment by using forked workers
        pool: 'forks',
        threads: false,
      },
    },
  })
);
