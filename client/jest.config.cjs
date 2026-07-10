module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testMatch: ["<rootDir>/tests/**/*.test.{js,jsx}"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  clearMocks: true,
  collectCoverageFrom: [
    "src/components/**/*.{js,jsx}",
    "src/services/**/*.js",
  ],
};
