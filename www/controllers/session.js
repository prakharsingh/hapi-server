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
      handler: function (request, reply) {
        request.server.auth.test('session', request, function (err, credentials) {
          if(err) {
            return reply(Boom.unauthorized('Session expired. Please login again.'));
          }

          reply({ credentials: credentials });
        });
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
      handler: function (request, reply) {
        const payload = request.payload;

        UserSchema
          .findOne({ email: payload.email }, function (err, user) {
            if(err) {
              console.error('Error in finding user', err);
              return reply(Boom.badRequest('Internal MongoDB error'));
            }

            if(!user) return reply(Boom.unauthorized("Incorrect email/password!!!"));

            CryptHelper
              .compareHash(payload.password, user.password)
              .then(matched => {
                if (matched) {
                  UserSchema
                    .canLogin(user._id)
                    .then((cred) => {
                      request.cookieAuth.set({ id: cred._id });
                      reply({credentials: cred});
                    })
                    .catch(err => {
                      console.log('[error sign in]', err);
                      reply({ err: err }).code(401);
                    });
                } else {
                  reply(Boom.unauthorized("Incorrect email/password!!!"))
                }
              })
              .catch(err => reply(Boom.unauthorized("Incorrect email/password!!!")));
          });
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
      handler: function (request, reply) {
        let payload = request.payload;

        if(payload.password !== payload.confirmPassword) return reply(Boom.badRequest('Password and Confirm Password do not match!!!'));

        UserSchema
          .findOne({ email: payload.email }, {}, function (err, exists) {
            if(err) {
              console.log('error in finding user', err);
              return reply(Boom.internal('Internal MongoDB error'));
            }
            if(exists) {
              return reply(Boom.badRequest('A user with this email already exists!!!'));
            }

            CryptHelper
              .genHash(payload.password)
              .then(hash => {
                delete payload.confirmPassword;

                payload.roles = [ 2 ];
                payload.password = hash;

                UserSchema
                  .create(payload, function(err, user) {
                    if(err) {
                      console.log('Error in inserting new user', err);
                      return reply(Boom.internal('Internal MongoDB error'));
                    }

                    UserSchema
                      .canLogin(user._id)
                      .then(cred => {
                        reply({ credentials: cred });
                      })
                      .catch(err => {
                        console.log('[error sign up]', err);
                        reply(Boom.unauthorized(err));
                      });
                  })
              })
              .catch(err => console.error(err));
          });
      }
    }
  },
];