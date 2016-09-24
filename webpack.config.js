const webpack = require('webpack');

module.exports = {
  entry: './src/index.jsx',
  output: {
    path: './dist/',
    filename: 'bundle.js'
  },
  devtool: 'cheap-module-source-map',
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  }
};
