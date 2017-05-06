'use strict';
const Path        = require('path');
const Config      = require('config');

module.exports = {
  connections: [
    {
      host: Config.app.host,
      port: Config.app.port,
      routes: {
       log: true
      }
    }
  ],
  registrations: [
    {
      plugin: {
        register: './plugins/auth',
        options: {
          appSecret: Config.appSecret
        }
      }
    },
    {
      plugin: {
        register: 'hapi-router',
        options: {
          routes: '**/*.js',
          cwd: Path.join(__dirname, 'controllers')
        }
      }
    },
    {
      plugin: {
        register: 'good',
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
    }
  ]
};
