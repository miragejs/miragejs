let internal = {
  displayName: "internal",
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!lodash)"],
  setupFilesAfterEnv: ["jest-extended"],
  testMatch: ["**/__tests__/internal/**/*-test.[jt]s?(x)"],
  moduleNameMapper: {
    "@lib(.*)": "<rootDir>/lib$1",
    "@miragejs/server": "<rootDir>/lib/index"
  }
};

// let esmBundle = {
//   displayName: "esm bundle",
//   transformIgnorePatterns: ["<rootDir>/node_modules/(?!lodash)"],
//   setupFilesAfterEnv: ["jest-extended"],
//   testMatch: ["**/__tests__/integration/**/*-test.[jt]s?(x)"],
//   moduleNameMapper: {
//     "@lib(.*)": "<rootDir>/dist/mirage-esm",
//     "@miragejs/server": "<rootDir>/dist/mirage-esm"
//   }
// };
//
// let umdBundle = {
//   displayName: "umd bundle",
//   setupFilesAfterEnv: ["jest-extended"],
//   testMatch: ["**/__tests__/integration/**/*-test.[jt]s?(x)"],
//   moduleNameMapper: {
//     "@lib(.*)": "<rootDir>/dist/mirage-umd",
//     "@miragejs/server": "<rootDir>/dist/mirage-umd"
//   }
// };
//
// let cjsBundle = {
//   displayName: "cjs bundle",
//   transformIgnorePatterns: ["<rootDir>/node_modules/(?!lodash)"],
//   setupFilesAfterEnv: ["jest-extended"],
//   testMatch: ["**/__tests__/integration/**/*-test.[jt]s?(x)"],
//   moduleNameMapper: {
//     "@lib(.*)": "<rootDir>/dist/mirage-cjs",
//     "@miragejs/server": "<rootDir>/dist/mirage-cjs"
//   }
// };

// External API, Create React App-like environment.
let browserEnvironmentConsumingCjs = {
  displayName: "browserEnvironmentConsumingCjs",
  testEnvironment: "jsdom",
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!lodash)"],
  setupFilesAfterEnv: ["jest-extended"],
  testMatch: [
    "**/__tests__/external/shared/**/*-test.[jt]s?(x)",
    "**/__tests__/external/browser-only/**/*-test.[jt]s?(x)"
  ],
  moduleNameMapper: {
    "@miragejs/server": "<rootDir>/dist/mirage-cjs"
  }
};

// External API, Gatsby-like environment (SSR of client-side code)
let nodeEnvironmentConsumingCjs = {
  displayName: "nodeEnvironmentConsumingCjs",
  testEnvironment: "node",
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!lodash)"],
  setupFilesAfterEnv: ["jest-extended"],
  testMatch: [
    "**/__tests__/external/shared/**/*-test.[jt]s?(x)",
    "**/__tests__/external/node-only/**/*-test.[jt]s?(x)"
  ],
  moduleNameMapper: {
    "@miragejs/server": "<rootDir>/dist/mirage-cjs"
  }
};

// From Ryan's PR. Run all tests in Node. (Lots will fail.)
// let node = {
//   displayName: "node",
//   transformIgnorePatterns: ["<rootDir>/node_modules/(?!lodash)"],
//   setupFilesAfterEnv: ["jest-extended"],
//   testEnvironment: "node",
//   testMatch: ["**/__tests__/**/*-test.[jt]s?(x)"],
//   testPathIgnorePatterns: [
//     "<rootDir>/__tests__/browser-only/",
//     "/node_modules/"
//   ],
//   moduleNameMapper: {
//     "@lib(.*)": "<rootDir>/lib$1",
//     "@miragejs/server": "<rootDir>/lib/index",
//     pretender: "<rootDir>/shims/pretender-node.js"
//   }
// };

// let eslint = {
//   displayName: "lint",
//   runner: "jest-runner-eslint",
//   cliOptions: {
//     config: "./.eslintrc.js"
//   },
//   // testMatch: ["<rootDir>/__tests__/**/*.js", "<rootDir>/lib/**/*.js"]
//   testMatch: ["<rootDir>/lib/response.js"]
// };

module.exports = {
  // Only browser for now, but add back in bundles soon
  // projects: [browser]
  projects: [
    internal,
    browserEnvironmentConsumingCjs,
    nodeEnvironmentConsumingCjs
  ]
};
