require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  extends: ['@internal/eslint-config/profile/lib'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json'
  },
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  rules: {
    'prettier/prettier': ['warn']
  }
};
