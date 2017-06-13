import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import gulp from 'gulp';
import {log, colors} from 'gulp-util';

import {createWebpackConfig} from '../webpack.config';
import {dist} from '../paths';

gulp.task('client.serve.dev', function () {
  const {PORT = 8000} = process.env;

  const config = createWebpackConfig('development');
  const compiler = webpack(config);

  const serverOptions = {
    publicPath: dist('client'),
    hot: true,
  };
  const server = new WebpackDevServer(compiler, serverOptions);

  return new Promise(() => {
    server.listen(PORT, 'localhost', () => {
      log(`Client dev server listening at http://localhost:${PORT}`);
    });
  });
});

gulp.task('client.build', function () {
  const config = createWebpackConfig('production');
  return new Promise((ok, fail) => {
    webpack(config, (err, stats) => {
      if (err) {
        log(colors.red(err));
        fail(err);
        return;
      }
      log(colors.green('Webpack build complete'));
      log(stats);
      ok();
    });
  });
});
