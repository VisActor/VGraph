module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    rootDir: __dirname,
    setupFilesAfterEnv: [
        '<rootDir>/test/helper.ts'
    ],
    testMatch: [
        '<rootDir>/test/**/*.spec.ts'
    ],
    transform: {
        '^.+\\.jsx?$': 'babel-jest',
        '^.+\\.ts?$': 'ts-jest',
    },
    transformIgnorePatterns: [
        '/node_modules/(?!d3-(ease|interpolate|color|quadtree|timer)|@dp/xgraph-(vital|topo|utils|layouts|components))',
    ],
};
