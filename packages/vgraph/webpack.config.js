const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const exmapleEntries = glob.sync('./examples/**/**/*.ts');

let multipleHtmlPlugins = [];
const entriesMap = {};

exmapleEntries.forEach(entry => {
  const filename = path.parse(entry).name;
  if (filename.match(/\.worker$/)) {
    return;
  }

  multipleHtmlPlugins.push(
    new HtmlWebpackPlugin({
      template: 'examples/index.html',
      filename: `${filename}.html`,
      chunks: [`${filename}`],
    })
  );

  entriesMap[`${filename}`] = entry;
});


module.exports = {
  mode: 'development',
  entry: entriesMap,
  devServer: {
    hot: true,
    port: 9001,
    client: {
      overlay: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.worker\.ts$/,
        loader: 'worker-loader',
        options: {
          esModule: true,
        }
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, 'tsconfig.examples.json'),
            transpileOnly: true,
          },
        },
        exclude: [/node_modules/, /monorepo/],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    // globalObject: 'this'
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      templateContent: `
        <html>
          <body>
            <h1>vGraph examples</h1>
            <ul>
              ${Object.keys(entriesMap).map(entry => `<li><a href="./${entry}.html">${entry}</a>`).join('\n')}
            </ul>
          </body>
        </html>
      `
    })
  ].concat(multipleHtmlPlugins),
};