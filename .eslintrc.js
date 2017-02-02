module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    'plugin:ember-suave/recommended'
  ],
  env: {
    'browser': true
  },
  rules: {
    'camelcase': 0,
    'ember-suave/no-direct-property-access': 0,
    'ember-suave/prefer-destructuring': 0,
    'object-curly-spacing': 0,
    'quotes': 0,
    'array-bracket-spacing': 0,
    'no-var': 0,
    'object-shorthand': 0,
    'arrow-parens': 0,
    'no-unused-vars': ['error', { 'args': 'none' }]
  },
  globals: {
    faker: true,
    server: true,
    $: true
  }
};
