"use strict";

const _ = require('lodash');
const Cookie = require('hapi-auth-cookie');

const UserSchema = require('../models').UserSchema;
const Roles = require('../constants/roles');

exports.register = function (server, options, next) {
  const settings = Object.assign({}, options);

  server.register(Cookie, function (err) {
    if (err) throw err;

    server.auth.strategy('session', 'cookie', 'try', {
      password: settings.appSecret,
      isSecure: false,
      isHttpOnly: true,
      clearInvalid: true,
      validateFunc: function (request, session, callback) {
        UserSchema
          .canLogin(session.id)
          .then(user => {
            user.scope = _.find(Roles, { role: _.max(user.roles) }).type;
            callback(null, true, user)
          })
          .catch(err => callback(err));
      }
    });
  });
  next();
};

exports.register.attributes = {
  name: 'auth',
  version: '0.0.1'
};
