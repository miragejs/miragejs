let internal = {
  displayName: "internal",
  setupFilesAfterEnv: ["jest-extended/all"],
  testEnvironment: "jsdom",
  testMatch: ["**/__tests__/internal/**/*-test.[jt]s?(x)"],
  moduleNameMapper: {
    "@lib(.*)": "<rootDir>/lib$1",
    "^miragejs$": "<rootDir>/lib/index",
  },
};

// External API, Create React App-like environment.
let browserEnvironmentConsumingEsm = {
  displayName: "browserEnvironmentConsumingEsm",
  testEnvironment: "jsdom",
  transform: {},
  setupFilesAfterEnv: ["jest-extended/all"],
  testMatch: [
    "**/__tests__/external/shared/**/*-test.[jt]s?(x)",
    "**/__tests__/external/browser-only/**/*-test.[jt]s?(x)",
  ],
  moduleNameMapper: {
    "^miragejs$": "<rootDir>/dist/mirage.mjs",
  },
};

// External API, Gatsby-like environment (SSR of client-side code)
let nodeEnvironmentConsumingEsm = {
  displayName: "nodeEnvironmentConsumingEsm",
  testEnvironment: "node",
  transform: {},
  setupFilesAfterEnv: ["jest-extended/all"],
  testMatch: [
    "**/__tests__/external/shared/**/*-test.[jt]s?(x)",
    "**/__tests__/external/node-only/**/*-test.[jt]s?(x)",
  ],
  moduleNameMapper: {
    "^miragejs$": "<rootDir>/dist/mirage.mjs",
  },
};

// External API, Create React App-like environment.
let browserEnvironmentConsumingCjs = {
  displayName: "browserEnvironmentConsumingCjs",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["jest-extended/all"],
  testMatch: [
    "**/__tests__/external/shared/**/*-test.[jt]s?(x)",
    "**/__tests__/external/browser-only/**/*-test.[jt]s?(x)",
  ],
  moduleNameMapper: {
    "^miragejs$": "<rootDir>/dist/mirage.cjs",
  },
};

// External API, Gatsby-like environment (SSR of client-side code)
let nodeEnvironmentConsumingCjs = {
  displayName: "nodeEnvironmentConsumingCjs",
  testEnvironment: "node",
  setupFilesAfterEnv: ["jest-extended/all"],
  testMatch: [
    "**/__tests__/external/shared/**/*-test.[jt]s?(x)",
    "**/__tests__/external/node-only/**/*-test.[jt]s?(x)",
  ],
  moduleNameMapper: {
    "^miragejs$": "<rootDir>/dist/mirage.cjs",
  },
};

// External API, script tag or Code Sandbox
let browserEnvironmentConsumingUmd = {
  displayName: "browserEnvironmentConsumingUmd",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["jest-extended/all"],
  testMatch: [
    "**/__tests__/external/shared/**/*-test.[jt]s?(x)",
    "**/__tests__/external/browser-only/**/*-test.[jt]s?(x)",
  ],
  moduleNameMapper: {
    "^miragejs$": "<rootDir>/dist/mirage-umd.cjs",
  },
};

module.exports = {
  projects: [
    internal,
    browserEnvironmentConsumingEsm,
    nodeEnvironmentConsumingEsm,
    browserEnvironmentConsumingCjs,
    nodeEnvironmentConsumingCjs,
    browserEnvironmentConsumingUmd,
  ],
};
