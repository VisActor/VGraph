module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  rootDir: __dirname,
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.test.json",
    },
  },
  testMatch: ["<rootDir>/test/**/*.spec.tsx"],
  setupFiles: ["<rootDir>/test/jest.setup.ts"],
  setupFilesAfterEnv: ["<rootDir>/test/helper.ts"],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.ts?$": "ts-jest",
    "^.+\\.(css|less)$": "./style_mock.js",
  },
  testPathIgnorePatterns: ["/<rootDir>.*.less$/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  transformIgnorePatterns: [
    "/node_modules/(?!.*d3-(ease|interpolate|color|quadtree|timer))",
  ],
};
