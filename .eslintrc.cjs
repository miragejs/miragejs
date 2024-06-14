module.exports = {
  root: true,
  parser: "@babel/eslint-parser",
  plugins: ["import"],
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:prettier/recommended",
  ],
  env: {
    es6: true,
    node: true,
    browser: true,
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
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: [
          "__tests__",
          "*.config.js",
          "*.config.mjs",
          "*.config.cjs",
        ],
      },
    ],
  },
  overrides: [
    {
      files: ["jest.config.cjs", "babel.config.cjs", "rollup.config.mjs"],
      env: {
        browser: false,
        node: true,
      },
    },
    {
      files: ["__tests__/**"],
      plugins: ["jest"],
      env: {
        "jest/globals": true,
      },
      extends: ["plugin:jest/recommended", "plugin:jest/style"],
      rules: {
        "jest/no-conditional-expect": "off",
      },
    },
  ],
  settings: {
    "import/resolver": {
      alias: [
        ["@lib", "./lib"],
        ["miragejs", "./index"],
      ],
      node: {
        extensions: ["js", "cjs", "mjs"],
      },
    },
  },
};
