const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './src/umd.ts',
  output: {
    filename: 'xgraph.min.js',
    library: {
      name: 'xgraph',
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
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
      {
        test: /\.js$/,
        include: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  externals: {
    lodash: 'lodash',
  },
  plugins: [new webpack.optimize.AggressiveMergingPlugin()],
  devtool: 'source-map',
};