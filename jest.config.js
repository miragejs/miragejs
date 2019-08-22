let browser = {
  displayName: "browser",
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!lodash)"],
  setupFilesAfterEnv: ["jest-extended"],
  testMatch: ["**/__tests__/**/*-test.[jt]s?(x)"],
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
//     "@lib(.*)": "<rootDir>/dist/mirage-ems",
//     "@miragejs/server": "<rootDir>/dist/mirage-ems"
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
  projects: [browser]
};
