"use strict";

const Mongoose = require('mongoose');
const Config = require('config');

Mongoose.Promise = global.Promise;

module.exports = {
  connect: () => {
    internals
      .connect()
      .on('error', error => {
        console.log('[Error in connecting to database]', error);
      })
      .on('disconnected', internals.connect)
      .once('open', () => {
        console.log('Database connected successfully!!!');
      });
  },

  close: function () {
    console.log('Database disconnected.');
    return Mongoose.connection.close()
  }
};

const internals = {
  connect: function () {
    const options = {server: {socketOptions: {keepAlive: 1}}};
    let connectionString = `mongodb://${Config.db.host}:${Config.db.port}/${Config.db.name}`;

    if (process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
      connectionString = `mongodb://${Config.db.userName}:${Config.db.password}@${Config.db.host}:${Config.db.port}/${Config.db.name}`;
    }

    return Mongoose.connect(connectionString, options).connection;
  }
};
