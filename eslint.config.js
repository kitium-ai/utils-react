/* eslint-disable import/no-default-export */
import { react_spa } from '@kitiumai/lint';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  ...react_spa.flat(),
  {
    name: 'utils-react/react-hooks-for-ts',
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    name: 'utils-react/eslint9-rule-compat',
    rules: {
      // ESLint 9 schema compatibility for lint preset
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
      // Disabled temporarily due to eslint-plugin-import relying on CJS-only minimatch.
      'import/order': 'off',
    },
  },
];
