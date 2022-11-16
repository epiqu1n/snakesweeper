/* eslint-disable no-unused-vars */
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ReactRefreshTypeScript from 'react-refresh-typescript';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

const isDevEnv = process.env.NODE_ENV === 'development';

export default {
  entry: './client/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  devtool: 'eval-source-map', // inline-source-map?
  mode: process.env.NODE_ENV,
  devServer: {
    host: 'localhost',
    port: 8080,
    hot: true,
    // historyApiFallback: true,
    static: {
      directory: path.resolve(__dirname, 'dist'),
      publicPath: '/'
    },
    // headers: { 'Access-Control-Allow-Origin': '*' },
    proxy: {
      '/api/**': {
        target: 'http://localhost:3000/',
        secure: false
      },
      '/assets/**': {
        target: 'http://localhost:3000/',
        secure: false
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.s?css$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            getCustomTransformers: () => ({
              before: [isDevEnv && ReactRefreshTypeScript()].filter(Boolean),
            }),
            transpileOnly: isDevEnv
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './client/index.html'
    }),
    isDevEnv && new ReactRefreshWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin()
  ].filter(Boolean),
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  }
};