import tsEslint from 'typescript-eslint';

export default tsEslint.config(
  ...tsEslint.configs.recommended,
  {
    rules: {
      'semi': 'error',
      'quotes': ['error', 'single'],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  }
);
