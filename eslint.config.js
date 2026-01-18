import globals from 'globals';

export default [
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      // Unused variables: warn, but ignore if prefixed with _
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      // Curly braces: only require for multi-line blocks
      curly: ['warn', 'multi-line'],
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',
      // Disabled: conflicts with require-await when only await is on return
      'no-return-await': 'off',
      // Disabled: many async functions are intentionally async for API consistency
      'require-await': 'off',
    },
    ignores: ['node_modules/**', 'coverage/**', 'dist/**'],
  },
];
