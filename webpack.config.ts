/* eslint-disable no-unused-vars */
import webpack, { Configuration, WebpackPluginInstance } from 'webpack';
import { Configuration as DevServerConfig } from 'webpack-dev-server';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ReactRefreshTypeScript from 'react-refresh-typescript';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import server_config from './server/server.config.json';
import fs from 'fs';

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
    port: 8443,
    server: {
      type: 'https',
      options: {
        key: fs.readFileSync(path.join(__dirname, `./server/ssl/${server_config.sslKey}`)),
        cert: fs.readFileSync(path.join(__dirname, `./server/ssl/${server_config.sslCert}`))
      }
    },
    hot: true,
    open: false,
    // historyApiFallback: true,
    static: {
      directory: path.resolve(__dirname, 'dist'),
      publicPath: '/'
    },
    // headers: { 'Access-Control-Allow-Origin': '*' },
    proxy: {
      '/api/**': {
        target: `https://localhost:${server_config.httpsPort}/`,
        secure: false
      },
      '/assets/**': {
        target: `https://localhost:${server_config.httpsPort}/`,
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
    new ForkTsCheckerWebpackPlugin()
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  }
};

if (isDevEnv) config.plugins?.push(new ReactRefreshWebpackPlugin());

export default config;
