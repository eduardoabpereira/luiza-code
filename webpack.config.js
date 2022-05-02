const path = require('path');
const buildPath = path.resolve(__dirname, 'dist');

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  target: 'web',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      }
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  entry: './src/reserva.js',
  devServer: {
    static: './dist',
    port: 9000
  },
  output: {
    filename: 'main.js',
    path: buildPath,
    publicPath: buildPath
  },
};
