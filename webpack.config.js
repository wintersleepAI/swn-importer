/* JS build config (TypeScript removed) */
const path = require("path");

module.exports = {
  entry: "./src/module.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "module.js",
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: { loader: "babel-loader" }
      }
    ]
  },
  resolve: { extensions: [".js", ".json"] }
};
