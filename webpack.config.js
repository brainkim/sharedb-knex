const path = require("path");

module.exports = {
  mode: "none",
  entry: {
    index: "./index.js",
  },
  output: {
    path: path.resolve(__dirname, "lib"),
    filename: "index.js",
    libraryTarget: "umd",
  },
  externals: {
    sharedb: "sharedb",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
};
