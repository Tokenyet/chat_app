/**
 * @type {import("eslint").Linter.Config}
 */
const config = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['plugin:react/recommended', 'google', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    'object-curly-spacing': ['error', 'always'],
    'quotes': ['warn', 'single'],
    'require-jsdoc': 0,
    'max-len': 'off',
    'react/display-name': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'no-unused-vars': 'off',
    'new-cap': 0
    // 'react/jsx-curly-spacing': ['warn', {
    //   'when': 'never',
    //   'children': {
    //     'when': 'always',
    //   },
    // }],
  },
};

module.exports = config;
