import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**', '.agent/**'] },
  {
    files: ['src/**/*.ts', 'tests/**/*.ts', 'vitest.config.mts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@application/*',
                '@infrastructure/*',
                '**/application/**',
                '**/infrastructure/**',
              ],
              message: 'Domain dependencies must point inward.',
            },
          ],
          paths: ['express', 'typeorm', 'awilix', 'zod', 'pino'],
        },
      ],
    },
  },
);
