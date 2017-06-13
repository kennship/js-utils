// import webpack from 'webpack';
import {clientSource, clientDist} from './paths';
import createBabelConfig from 'kn-babel';

/**
 * Generate a Webpack configuration.
 */
export function createWebpackConfig(env = 'production', opts = {}) {
  const {
    entry = clientSource,
    outputPath = clientDist,
  } = opts;
  return {
    devtool: 'source-map',
    entry: {
      app: [
        'babel-polyfill',
        ...(env === 'production' ? [] : ['react-hot-loader/patch']),
        entry,
      ],
    },
    output: {
      path: outputPath,
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: createBabelConfig({env, runtime: 'browser'}),
        },
      ],
    },
  };
}

export default createWebpackConfig();
