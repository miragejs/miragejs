module.exports = {
  root: true,
  parser: "babel-eslint",
  plugins: ["jest"],
  extends: [
    "eslint:recommended",
    "plugin:jest/recommended",
    "plugin:jest/style"
  ],
  env: {
    "jest/globals": true,
    es6: true,
    node: true
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
  },
  overrides: [
    {
      files: ["jest.config.js", "babel.config.js"],
      env: {
        browser: false,
        node: true
      }
    },
    {
      files: ["__tests__/**"],
      env: {
        browser: true
      }
    }
  ]
};
