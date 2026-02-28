module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    rootDir: __dirname,
    // 无测试文件时不加载额外的环境配置，避免缺失文件导致校验失败
    testMatch: [
        '<rootDir>/**/*.spec.ts'
    ],
    transform: {
        '^.+\\.jsx?$': 'babel-jest',
        '^.+\\.ts?$': 'ts-jest',
    },
    transformIgnorePatterns: [
        '/node_modules/(?!d3-(ease|interpolate|color))',
    ],
};
