export default {
  rootDir: ".",
  testEnvironment: "node",
  transform: {},
  testMatch: ["**/tests/**/*.test.js"],
  testTimeout: 60000,
  maxWorkers: 1,
  verbose: true,
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/index.js",
    "!src/redis/config.js",
    "!src/sockets/index.js",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "clover"],
};
