let internal = {
  displayName: "internal",
  setupFilesAfterEnv: ["jest-extended"],
  testMatch: ["**/__tests__/internal/**/*-test.[jt]s?(x)"],
  moduleNameMapper: {
    "@lib(.*)": "<rootDir>/lib$1",
    "@miragejs/server": "<rootDir>/lib/index"
  }
};

let browserEnvironmentConsumingEsm = {
  displayName: "browserEnvironmentConsumingEsm",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["jest-extended"],
  testMatch: [
    "**/__tests__/external/shared/**/*-test.[jt]s?(x)",
    "**/__tests__/external/browser-only/**/*-test.[jt]s?(x)"
  ],
  moduleNameMapper: {
    "@miragejs/server": "<rootDir>/dist/mirage-esm.js"
  }
};

let nodeEnvironmentConsumingEsm = {
  displayName: "browserEnvironmentConsumingEsm",
  testEnvironment: "node",
  setupFilesAfterEnv: ["jest-extended"],
  testMatch: [
    "**/__tests__/external/shared/**/*-test.[jt]s?(x)",
    "**/__tests__/external/node-only/**/*-test.[jt]s?(x)"
  ],
  moduleNameMapper: {
    "@miragejs/server": "<rootDir>/dist/mirage-esm.js"
  }
};

let browserEnvironmentConsumingUmd = {
  displayName: "browserEnvironmentConsumingUmd",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["jest-extended"],
  testMatch: [
    "**/__tests__/external/shared/**/*-test.[jt]s?(x)",
    "**/__tests__/external/browser-only/**/*-test.[jt]s?(x)"
  ],
  moduleNameMapper: {
    "@miragejs/server": "<rootDir>/dist/mirage-umd"
  }
};

let nodeEnvironmentConsumingUmd = {
  displayName: "nodeEnvironmentConsumingUmd",
  testEnvironment: "node",
  setupFilesAfterEnv: ["jest-extended"],
  testMatch: [
    "**/__tests__/external/shared/**/*-test.[jt]s?(x)",
    "**/__tests__/external/node-only/**/*-test.[jt]s?(x)"
  ],
  moduleNameMapper: {
    "@miragejs/server": "<rootDir>/dist/mirage-umd"
  }
};

// External API, Create React App-like environment.
let browserEnvironmentConsumingCjs = {
  displayName: "browserEnvironmentConsumingCjs",
  testEnvironment: "jsdom",
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
  setupFilesAfterEnv: ["jest-extended"],
  testMatch: [
    "**/__tests__/external/shared/**/*-test.[jt]s?(x)",
    "**/__tests__/external/node-only/**/*-test.[jt]s?(x)"
  ],
  moduleNameMapper: {
    "@miragejs/server": "<rootDir>/dist/mirage-cjs"
  }
};

module.exports = {
  projects: [
    // internal,
    // browserEnvironmentConsumingCjs,
    // nodeEnvironmentConsumingCjs,
    // browserEnvironmentConsumingEsm,
    nodeEnvironmentConsumingEsm
    // browserEnvironmentConsumingUmd,
    // nodeEnvironmentConsumingUmd
  ]
};
