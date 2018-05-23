const path = require("path");

module.exports = {
  entry: {
    index: "./index.js",
  },
  output: {
    path: path.resolve(__dirname, "lib"),
    filename: "index.js",
    libraryTarget: "commonjs2",
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
