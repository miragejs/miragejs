let jsdom = {
  displayName: "jsdom",
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!lodash-es)"],
  setupFilesAfterEnv: ["jest-extended"],
  testMatch: ["**/__tests__/**/*-test.[jt]s?(x)"],
  moduleNameMapper: {
    "@lib(.*)": "<rootDir>/lib$1",
    "@miragejs/server": "<rootDir>/lib/index"
  }
};

let server = {
  displayName: "server",
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!lodash-es)"],
  setupFilesAfterEnv: ["jest-extended"],
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*-test.[jt]s?(x)"],
  moduleNameMapper: {
    "@lib(.*)": "<rootDir>/lib$1",
    "@miragejs/server": "<rootDir>/lib/index",
    pretender: "<rootDir>/shims/pretender-node.js"
  }
};

module.exports = {
  projects: [jsdom, server]
};
