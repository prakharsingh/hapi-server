'use strict';
const Path = require('path');
const Config = require('config');

module.exports = {
  server: {
    host: Config.app.host,
    port: Config.app.port,
    routes: {
      cors: { origin: ["*"] },
      log: { collect: true }
    }
  },
  register: {
    plugins: [
      {
        plugin: './plugins/auth',
        options: {
          appSecret: Config.appSecret
        }
      },
      {
        plugin: 'hapi-router',
        options: {
          routes: '**/*.js',
          cwd: Path.join(__dirname, 'controllers')
        }
      },
      {
        plugin: 'good',
        options: {
          reporters: {
            myConsoleReporter: [{
              module: 'good-squeeze',
              name: 'Squeeze',
              args: [{ log: '*', response: '*', error: '*' }]
            }, {
              module: 'good-console'
            }, 'stdout']
          }
        }
      }
    ],
  }
};
