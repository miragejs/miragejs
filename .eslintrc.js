module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  plugins: [
  ],
  extends: [
    'eslint:recommended',
  ],
  env: {
    browser: true
  },
  rules: {
    'camelcase': 0,
    'object-curly-spacing': 0,
    'quotes': 0,
    'array-bracket-spacing': 0,
    'no-var': 0,
    'object-shorthand': 0,
    'arrow-parens': 0,
    'no-unused-vars': ['error', { 'args': 'none' }]
  },
  globals: {
  },
  overrides: [
    // node files
    {
      files: [
        '.template-lintrc.js',
        'index.js',
        'testem.js',
        'config/**/*.js',
        'tests/dummy/config/**/*.js',
      ],
      excludedFiles: [
        'addon/**',
        'addon-test-support/**',
        'app/**',
        'tests/dummy/app/**'
      ],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2018
      },
      env: {
        browser: false,
        node: true
      },
      plugins: ['node'],
      rules: Object.assign({}, require('eslint-plugin-node').configs.recommended.rules, {
        // add your custom rules and overrides for node files here
      })
    },

    // test files. Can remove when we upgrade tests to new style.
    {
      files: ['tests/**/*.js'],
      excludedFiles: ['tests/dummy/**/*.js'],
      env: {
      }
    },
  ]
};
