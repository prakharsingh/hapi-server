const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

const src = {};

// Launch a Node.js/hapi server
gulp.task('default', function (cb) {
  src.server = ['www/**/*.*'];

  let started = false;
  const cp = require('child_process');

  let server = (function startup() {

    const child = cp.fork('bin/www', {
      env: Object.assign({ NODE_ENV: 'development' }, process.env)
    });

    child.once('message', function (message) {
      if (message.match(/^online$/)) {
        $.util.log('Development server started.');
        if (!started) {
          started = true;

          gulp.watch(src.server, function () {
            $.util.log('Restarting development server.');
            server.kill('SIGTERM');
            server = startup();
          });
          cb();
        }
      }
    });
    return child;
  })();

  process.on('exit', function () {
    server.kill('SIGTERM');
  });
});
