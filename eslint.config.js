/**
 * ESLint configuration for @kitiumai/utils-react
 * Using the latest @kitiumai/lint 2.0 with React presets
 */
import baseConfig from '@kitiumai/config/eslint.config.base.js';
import { createKitiumConfig, eslintReactConfig } from '@kitiumai/lint';

export default createKitiumConfig({
  baseConfig: [...baseConfig, ...eslintReactConfig],
  additionalRules: {
    // React hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    // Utils package specific
    '@typescript-eslint/no-explicit-any': 'error',
    complexity: ['warn', 15],
  },
  overrides: [
    // Test files
    {
      files: ['**/*.test.tsx', '**/*.test.ts', '**/*.spec.tsx', '**/*.spec.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        'react-hooks/rules-of-hooks': 'off', // Testing can break hook rules
      },
    },
  ],
});
