/* eslint-disable no-unused-vars */
import webpack, { Configuration, WebpackPluginInstance } from 'webpack';
import { Configuration as DevServerConfig } from 'webpack-dev-server';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ReactRefreshTypeScript from 'react-refresh-typescript';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

const isDevEnv = process.env.NODE_ENV === 'development';

const config: Configuration = {
  entry: './client/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  devtool: 'eval-source-map', // inline-source-map?
  mode: (process.env.NODE_ENV === 'development' ? 'development' : 'production'),
  devServer: {
    host: '0.0.0.0',
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
      // Normal SCSS stylesheets
      {
        test: /\.s?css$/,
        exclude: [/node_modules/, /\.module\.s?css$/i],
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      // SCSS modules
      {
        test: /\.module\.s?css$/i,
        exclude: /node_modules/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: process.env.NODE_ENV === 'development' ? 'snek__[local]--[hash:base64:4]' : '[hash:base64:6]'
              },
            },
          },
          'sass-loader'
        ],
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
    isDevEnv ? new ReactRefreshWebpackPlugin() : ({} as WebpackPluginInstance),
    new ForkTsCheckerWebpackPlugin()
  ].filter(Boolean),
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  }
};

export default config;