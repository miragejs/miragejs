module.exports = {
  root: true,
  parser: "babel-eslint",
  plugins: ["import", "jest"],
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:jest/recommended",
    "plugin:jest/style",
    "plugin:prettier/recommended"
  ],
  env: {
    es6: true,
    node: true,
    browser: true
  },
  rules: {
    camelcase: 0,
    "object-curly-spacing": 0,
    quotes: 0,
    "array-bracket-spacing": 0,
    "no-var": 0,
    "object-shorthand": 0,
    "arrow-parens": 0,
    "no-unused-vars": ["error", { args: "none" }],
    "import/no-extraneous-dependencies": ["error", {"devDependencies": ["__tests__", "*.config.js"]}]
  },
  overrides: [
    {
      files: ["jest.config.js", "babel.config.js", "rollup.config.js", "rollup.test.config.js"],
      env: {
        browser: false,
        node: true
      }
    },
    {
      files: ["__tests__/**"],
      env: {
        "jest/globals": true
      }
    }
  ],
  settings: {
    "import/resolver": {
      alias: [
        ["@lib", "./lib"],
        ["@miragejs/server", "./index"]
      ],
      node: {
        extensions: ["js"]
      }
    }
  }
};
