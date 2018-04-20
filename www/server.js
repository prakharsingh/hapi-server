"use strict";
const Glue = require('glue');
const Database = require('./database');
const manifest = require('./manifest');

const options = {
  relativeTo: __dirname
};

module.exports = async function (cb) {
  try {
    const server = await Glue.compose(manifest, options);
    await server.start();

    Database.connect();


    if (process.send) {
      process.send('online');
    } else {
      console.log('Server started!', server.info.uri, " at: ", (new Date()));
    }

    // Gracefull shut down
    const stop = async function () {
      try {
        await server.stop();
        Database.close();
        console.log('Server stopped');
        process.exit(0);
      }
      catch (err) {
        console.log(err)
      }
    };

    process.on('unhandledRejection', (reason, p) => {
      console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    });

    process.on('SIGTERM', stop);
    process.on('SIGINT', stop);

    if (cb) return cb(server);
  }

  catch (err) {
    console.error(err);
    process.exit(0);
  }
};
