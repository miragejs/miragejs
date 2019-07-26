module.exports = {
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!lodash-es)"],
  setupFilesAfterEnv: ["jest-extended"],
  testMatch: ["**/__tests__/**/*-test.[jt]s?(x)"]
};
