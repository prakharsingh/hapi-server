"use strict";

const _ = require('lodash');
const Cookie = require('hapi-auth-cookie');

const UserSchema = require('../models').UserSchema;
const Roles = require('../constants/roles');

exports.plugin = {
  pkg: require('./package.json'),
  register: async (server, options) => {
    try {
      const settings = Object.assign({}, options);

      await server.register(Cookie);

      server.auth.strategy('session', 'cookie', {
        password: settings.appSecret,
        isSecure: false,
        isHttpOnly: true,
        clearInvalid: true,
        validateFunc: async (request, session) => {
          const user  = await UserSchema.canLogin(session.id);

          const out = {
            valid: !!user
          };

          if (out.valid) {
            user.scope = _.find(Roles, { role: _.max(user.roles) }).type;
            out.credentials = user;
          }

          return out;
        }
      });
    }
    catch (error) {
      throw new Error('Error in registering auth scheme!')
    }
  }
};