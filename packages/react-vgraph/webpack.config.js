const path = require("path");
const glob = require("glob");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const portfinder = require("portfinder");

const DEFAULT_PORT = 9002;
const exmapleEntries = glob.sync("./examples/**/**/*.tsx");

let multipleHtmlPlugins = [];
const entriesMap = {};

exmapleEntries.forEach((entry) => {
  const filename = path.parse(entry).name;
  if (filename.match(/\.worker$/)) {
    return;
  }

  multipleHtmlPlugins.push(
    new HtmlWebpackPlugin({
      template: "examples/index.html",
      filename: `${filename}.html`,
      chunks: [`${filename}`],
    })
  );

  entriesMap[`${filename}`] = entry;
});

module.exports = async () => {
  const port = await portfinder.getPortPromise({ port: DEFAULT_PORT });

  return {
    mode: "development",
    entry: entriesMap,
    devServer: {
      hot: true,
      port,
    },
    module: {
      rules: [
        {
          test: /\.worker\.ts$/,
          loader: "worker-loader",
          options: {
            esModule: true,
          },
        },
        {
          test: /\.tsx?$/,
          use: {
            loader: "ts-loader",
            options: {
              configFile: path.resolve(__dirname, "tsconfig.examples.json"),
            },
          },
          exclude: [/node_modules/, /monorepo/],
        },
        {
          test: /\.less$/i,
          use: ["style-loader", "css-loader", "less-loader"],
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "dist"),
      // globalObject: 'this'
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: "index.html",
        templateContent: `
        <html>
          <body>
            <h1>vGraph examples</h1>
            <ul>
              ${Object.keys(entriesMap)
                .map((entry) => `<li><a href="./${entry}.html">${entry}</a>`)
                .join("\n")}
            </ul>
            <div id="root"></div>
          </body>
        </html>
      `,
      }),
    ].concat(multipleHtmlPlugins),
  };
};
