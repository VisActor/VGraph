module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  rootDir: __dirname,
  moduleNameMapper: {
    '^@visactor/vgraph$': '<rootDir>/../vgraph/cjs/index.js',
    '^@visactor/vgraph/(.*)$': '<rootDir>/../vgraph/cjs/$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
  testMatch: ['<rootDir>/test/**/*.spec.tsx'],
  setupFiles: [],
  setupFilesAfterEnv: [],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.ts?$': 'ts-jest',
    '^.+\\.(css|less)$': '<rootDir>/style_mock.js',
  },
  testPathIgnorePatterns: ['/<rootDir>.*.less$/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transformIgnorePatterns: ['/node_modules/(?!.*d3-(ease|interpolate|color|quadtree|timer))'],
};
