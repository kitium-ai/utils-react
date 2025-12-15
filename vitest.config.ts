import { defineConfig } from 'vitest/config';
import { createKitiumVitestConfig } from '@kitiumai/vitest-helpers/config';

export default defineConfig(
  createKitiumVitestConfig({
    preset: 'browser',
    setupFiles: ['./tests/setup.ts'],
    projectName: '@kitiumai/utils-react',
  })
);
