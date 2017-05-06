"use strict";

const Database = require('./database');

// setup server
const Glue = require('glue');
const manifest = require('./manifest');

const options = {
  relativeTo: __dirname
};

module.exports = function (cb) {
  Glue.compose(manifest, options, (err, server) => {
    if (err) {
      throw err;
    }

    Database.connect();

    server.route({
      method: 'GET',
      path: '/',
      config: {
        handler: function (request, reply) {
          reply('Node Hapi REST Server');
        }
      }
    });

    server.start(() => {
      if (process.send) {
        process.send('online');
      } else {
        console.log('Server started!', server.info.uri, " at: ", (new Date()));
      }
    });

    // Gracefull shut down
    var stop = function () {
      Database.close();
      server.stop({timeout: 1000}, function () {
        process.exit(0);
        console.log('Server stopped');
      });
    };

    process.on('SIGTERM', stop);
    process.on('SIGINT', stop);

    if (cb) {
      cb(server);
    }
  });
};
