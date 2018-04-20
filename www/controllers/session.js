"use strict";

const Joi = require('joi');
const Boom = require('boom');

const UserSchema = require('../models/users');
const CryptHelper = require('../helpers/crypt');

module.exports = [
  {
    path: '/api/session',
    method: 'GET',
    config: {
      handler: async function (request) {
        try {
          return await request.server.auth.test('session', request);
        }
        catch (error) {
          return Boom.unauthorized('Session expired. Please login again!');
        }
      }
    }
  },
  {
    path: '/api/session',
    method: 'POST',
    config: {
      validate: {
        payload: {
          email: Joi.string().email().required().label('Email'),
          password: Joi.string().required().label('Password')
        }
      },
      handler: async function (request) {
        try {
          const { payload } = request;

          const user = await UserSchema.findOne({ email: payload.email });

          if (!user) return Boom.unauthorized("Incorrect email/password!!!");

          const matched = await CryptHelper.compareHash(payload.password, user.password);

          if (matched) {
            const credentials = await UserSchema.canLogin(user._id);
            await request.cookieAuth.set({ id: credentials._id });
            return { credentials };
          } else {
            return Boom.unauthorized("Incorrect email/password!!!");
          }
        }
        catch (error) {
          return Boom.internal(error);
        }
      }
    }
  },

  {
    path: '/api/accounts/register',
    method: 'POST',
    config: {
      validate: {
        payload: {
          firstName: Joi.string().required().label('First Name'),
          lastName: Joi.string().required().label('Last Name'),
          email: Joi.string().email().required().label('Email'),
          password: Joi.string().min(8).required().label('Password'),
          confirmPassword: Joi.string().min(8).optional().label('Confirm Password')
        }
      },
      handler: async (request) => {
        try {
          let { payload } = request;

          if(payload.password !== payload.confirmPassword) {
            return Boom.badRequest('Password and Confirm Password do not match!!!');
          }

          const existing = await UserSchema.findOne({ email: payload.email });

          if (existing) {
            return Boom.badRequest('A user with this email already exists!!!');
          }

          const hash = await CryptHelper.genHash(payload.password);

          if(hash) {
            delete payload.confirmPassword;

            payload.roles = [ 2 ];
            payload.password = hash;

            const user = await UserSchema.create(payload);
            const credentials = await UserSchema.canLogin(user._id);

            if(credentials) return { credentials };
          }
        }
        catch (error) {
          console.log(error);
          return Boom.internal(error);
        }

      }
    }
  },
];