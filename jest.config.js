let browser = {
  displayName: "browser",
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!lodash-es)"],
  setupFilesAfterEnv: ["jest-extended"],
  testMatch: ["**/__tests__/**/*-test.[jt]s?(x)"],
  moduleNameMapper: {
    "@lib(.*)": "<rootDir>/lib$1",
    "@miragejs/server": "<rootDir>/lib/index"
  }
};

let node = {
  displayName: "node",
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!lodash-es)"],
  setupFilesAfterEnv: ["jest-extended"],
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*-test.[jt]s?(x)"],
  testPathIgnorePatterns: [
    "<rootDir>/__tests__/browser-only/",
    "/node_modules/"
  ],
  moduleNameMapper: {
    "@lib(.*)": "<rootDir>/lib$1",
    "@miragejs/server": "<rootDir>/lib/index",
    pretender: "<rootDir>/shims/pretender-node.js"
  }
};

module.exports = {
  projects: [browser, node]
};
