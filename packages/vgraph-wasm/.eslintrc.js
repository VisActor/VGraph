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
    node: true,
    jest: true
  },
  globals: {
    __DEV__: 'readonly',
    __VERSION__: 'readonly',
    NodeJS: true
  },
  overrides: [
    {
      files: ['**/__tests__/**', '**/*.test.ts'],
      rules: {
        '@typescript-eslint/no-empty-function': 'off',
        'no-console': 'off',
        'dot-notation': 'off',
        'max-len': 'off',
        'max-statements-per-line': 'off'
      }
    },
    {
      files: ['**/examples/**'],
      rules: {
        '@typescript-eslint/no-empty-function': 'off',
        'no-console': 'off',
        'dot-notation': 'off',
        'radix': 'off',
        'max-len': 'off',
        'max-statements-per-line': 'off'
      }
    },
    {
      files: ['**/src/**'],
      rules: {
        '@typescript-eslint/no-empty-function': 'off',
        'no-undef': 'off',
        'no-eval': 'off',
        'max-len': 'off',
        'max-statements-per-line': 'off',
        'radix': 'off',
        'no-loop-func': 'off'
      }
    }
  ],
  ignorePatterns: ['scripts/**', 'nodejs/**', 'bundler.config.js', '*.tsx'],
  rules: {
    'prettier/prettier': ['warn'],
    'linebreak-style': [0, 'error', 'windows'],
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/consistent-type-imports': 'warn',
    '@typescript-eslint/no-empty-interface': 'error',
    '@typescript-eslint/no-empty-function': 'error',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/no-namespace': 'error',
    '@typescript-eslint/no-for-in-array': 'error',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
    '@typescript-eslint/method-signature-style': 'error',
    '@typescript-eslint/explicit-member-accessibility': [
      'warn',
      {
        overrides: {
          accessors: 'off',
          constructors: 'no-public',
          methods: 'no-public',
          properties: 'no-public',
          parameterProperties: 'explicit'
        }
      }
    ],
    'no-console': [
      1,
      {
        allow: ['warn', 'error']
      }
    ],
    'prefer-const': 2,
    'no-constant-condition': 0,
    'no-debugger': 2,
    'no-dupe-keys': 2,
    'no-empty-character-class': 2,
    'no-ex-assign': 2,
    'no-extra-boolean-cast': 0,
    'no-func-assign': 2,
    'no-inner-declarations': 2,
    'no-invalid-regexp': 2,
    'no-unsafe-negation': 2,
    'no-obj-calls': 2,
    'no-sparse-arrays': 2,
    'no-unreachable': 2,
    'use-isnan': 2,
    'valid-typeof': 2,
    eqeqeq: [
      'error',
      'always',
      {
        null: 'ignore'
      }
    ],
    'no-else-return': 1,
    'no-labels': [
      2,
      {
        allowLoop: true
      }
    ],
    'no-eval': 2,
    'no-extend-native': 2,
    'no-extra-bind': 0,
    'no-implied-eval': 2,
    'no-iterator': 2,
    'no-irregular-whitespace': 2,
    'no-lone-blocks': 2,
    'no-loop-func': 2,
    'no-multi-str': 2,
    'no-global-assign': 2,
    'no-new-wrappers': 2,
    'no-octal': 2,
    'no-octal-escape': 2,
    'no-proto': 2,
    'no-self-compare': 2,
    'no-unneeded-ternary': 2,
    'no-with': 2,
    radix: 2,
    'wrap-iife': [2, 'any'],
    'no-delete-var': 2,
    'no-dupe-args': 2,
    'no-duplicate-case': 2,
    'no-label-var': 2,
    'no-shadow-restricted-names': 2,
    'no-undef': 2,
    'no-undef-init': 2,
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 0,
    'new-parens': 2,
    'no-array-constructor': 2,
    'no-new-object': 2,
    'no-extra-parens': [2, 'functions'],
    'no-mixed-spaces-and-tabs': 2,
    'one-var': [2, 'never'],
    'max-nested-callbacks': [1, 5],
    'max-depth': [1, 6],
    'max-len': [
      'error',
      {
        code: 120,
        ignoreUrls: true,
        ignoreComments: true
      }
    ],
    'max-params': [1, 15],
    'space-infix-ops': 2,
    'dot-notation': [
      2,
      {
        allowKeywords: true,
        allowPattern: '^catch$'
      }
    ],
    'arrow-spacing': 2,
    'constructor-super': 2,
    'no-class-assign': 2,
    'no-const-assign': 2,
    'no-this-before-super': 0,
    'no-var': 2,
    '@typescript-eslint/no-duplicate-imports': 1,
    'prefer-rest-params': 1,
    'unicode-bom': 2,
    'max-statements-per-line': 2,
    'no-useless-constructor': 0,
    'func-call-spacing': 'off',
    '@typescript-eslint/func-call-spacing': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      1,
      {
        vars: 'local',
        args: 'none'
      }
    ],
    'no-restricted-globals': [2, 'event', 'name', 'length', 'orientation', 'top', 'parent', 'location', 'closed'],
    curly: 'error',
    'promise/catch-or-return': 'warn',
    'no-multi-spaces': 1,
    'no-multiple-empty-lines': [1, { max: 1 }],
    'no-trailing-spaces': 1
  }
};
