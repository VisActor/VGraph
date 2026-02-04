module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    rootDir: __dirname,
    setupFilesAfterEnv: [
        '<rootDir>/__tests__/helper.ts'
    ],
    testMatch: [
        '<rootDir>/__tests__/**/*.spec.ts'
    ],
    transform: {
        '^.+\\.jsx?$': 'babel-jest',
        '^.+\\.ts?$': 'ts-jest',
    },
    transformIgnorePatterns: [
        '/node_modules/(?!.*(d3-(ease|interpolate|color|quadtree|timer)|@visactor\\/vgraph-(vital|topo|utils|layouts|components)))',
    ],
};
