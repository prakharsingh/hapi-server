"use strict";

const Mongoose = require('mongoose');
const Config = require('config');

Mongoose.Promise = global.Promise;

module.exports = {
  connect: () => {
    internals
      .connect((err) => {
        if(err) return console.log('[Error in connecting to database]', error);
        console.log('Database connected successfully!!!');
      });
  },

  close: function () {
    console.log('Database disconnected.');
    return Mongoose.connection.close()
  }
};

const internals = {
  connect: function (cb) {
    const options = {
      poolSize: 10,
      promiseLibrary: global.Promise,
      autoReconnect: true,
    };
    const connectionString = `mongodb://${Config.db.host}:${Config.db.port}/${Config.db.name}`;
    return Mongoose.connect(connectionString, options, cb);
  }
};
