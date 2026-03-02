const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './src/umd.ts',
  output: {
    filename: 'vgraph-wasm.min.js',
    library: {
      name: 'vgraphWasm',
      type: 'umd',
      export: 'default',
      umdNamedDefine: true,
    },
    path: path.resolve(__dirname, './dist'),
    globalObject: 'this',
  },
  resolve: {
    // Add `.ts` as a resolvable extension.
    extensions: ['.ts', '.js'],
    alias: {
      '@visactor/vgraph': path.resolve(__dirname, '../vgraph/src/index.ts'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
    ],
  },
  externals: {
    lodash: 'lodash',
    '@visactor/vgraph': {
      commonjs: '@visactor/vgraph',
      commonjs2: '@visactor/vgraph',
      amd: '@visactor/vgraph',
      root: 'vgraph'
    }
  },
  plugins: [new webpack.optimize.AggressiveMergingPlugin()],
  devtool: 'source-map',
};