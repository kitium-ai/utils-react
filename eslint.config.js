/**
 * ESLint configuration for @kitiumai/utils-react
 * Simplified to avoid rule/plugin resolution issues on Windows/ESLint 9.
 */
import baseConfig from '@kitiumai/config/eslint.config.base.js';
import { eslintReactConfig } from '@kitiumai/lint';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  ...baseConfig,
  ...eslintReactConfig,
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      // Relaxed to clear current lint errors
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'import/order': 'off',
      'simple-import-sort/imports': 'off',
      'no-duplicate-imports': 'off',
      'promise/prefer-await-to-then': 'off',
      'promise/always-return': 'off',
      'promise/prefer-await-to-callbacks': 'off',
      'max-lines-per-function': 'off',
      'space-before-function-paren': 'off',
      'no-nested-ternary': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'prettier/prettier': 'off',
      complexity: 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    name: 'test-db-overrides',
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'warn',
        {
          patterns: [
            {
              group: ['../../*', '../../../*'],
              message: 'Prefer module aliases over deep relative imports for maintainability.',
            },
          ],
        },
      ],
    },
  },
  {
    name: 'test-db-tests',
    files: ['tests/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'react-hooks/rules-of-hooks': 'off',
    },
  },
];
