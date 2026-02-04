module.exports = {
    extends: ['plugin:@byted-lint/eslint-plugin-meta/typescript'],
    plugins: ['@byted-lint/eslint-plugin-meta'],
    env: {
      // Your environments (which contains several predefined global variables)
      //
      // browser: true,
      // node: true,
      // mocha: true,
      // jest: true,
      // jquery: true
    },
    globals: {
      // Your global variables (setting to false means it's not allowed to be reassigned)
      //
      // myGlobal: false
    },
    rules: {
      // Customize your rules
      'space-infix-ops': 'warn',
      'space-unary-ops': 'warn',
      'block-spacing': 'warn',
      '@typescript-eslint/no-invalid-void-type': 'warn',
      'no-multi-spaces': 'warn',
      quotes: [2, 'single'],
      indent: ['warn', 2, { 'SwitchCase': 1 }],
      curly: ['error', 'all'],
      'keyword-spacing': ['error', { before: true, after: true }]
    },
  }
  