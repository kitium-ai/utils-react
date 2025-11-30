/**
 * ESLint configuration for @kitiumai/utils-react
 * Using latest @kitiumai/lint 2.0 and @kitiumai/config 2.0 APIs
 */
import baseConfig from '@kitiumai/config/eslint.config.base.js';
import { createKitiumConfig } from '@kitiumai/lint';

export default createKitiumConfig({
  baseConfig,
  ignorePatterns: ['dist/**', '**/*.d.ts', '**/*.d.cts'],
  additionalRules: {
    // React utilities specific rules
    '@typescript-eslint/explicit-function-return-type': 'off', // Hooks often infer types
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-duplicate-imports': 'off', // Allow separate type and value imports
    complexity: ['warn', 20], // Hooks can be complex
  },
  overrides: [
    // Hook files don't need explicit return types (type inference works well)
    {
      files: ['src/hooks/**/*.ts', 'src/hooks/**/*.tsx'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        'no-duplicate-imports': 'off',
      },
    },
    // Test files
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
    // Integration files
    {
      files: ['src/integrations/**/*.ts', 'src/integrations/**/*.tsx'],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
    // Utility hooks can import from utils
    {
      files: ['src/hooks/utility/**/*.ts', 'src/hooks/utility/**/*.tsx'],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
  ],
});
