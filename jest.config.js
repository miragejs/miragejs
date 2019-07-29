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
  projects: [browser]
};
