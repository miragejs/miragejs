module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: "module"
  },
  plugins: ["jest"],
  extends: [
    "eslint:recommended",
    "plugin:jest/recommended",
    "plugin:jest/style"
  ],
  env: {
    "jest/globals": true
  },
  rules: {
    camelcase: 0,
    "object-curly-spacing": 0,
    quotes: 0,
    "array-bracket-spacing": 0,
    "no-var": 0,
    "object-shorthand": 0,
    "arrow-parens": 0,
    "no-unused-vars": ["error", { args: "none" }]
  }
};
