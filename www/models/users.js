"use strict";

const Mongoose  = require('mongoose');

const userSchema = new Mongoose.Schema({
  firstName       : { type: String },
  lastName        : { type: String },
  email           : { type: String, unique: true },
  password        : { type: String },
  roles           : [ { type: Number } ],
  updatedAt       : { type: Date },
  createdAt       : { type: Date, default: Date.now },
});


//todo: test this pre handler
userSchema.pre('update', function(next) {
  this.update({},{ $set: { updatedAt: new Date() } });
  next();
});


userSchema.statics.canLogin = function (id) {
  const self = this;

  return new Promise(function (resolve, reject) {

    self.findById(id, function (err, user) {
      if (err) return reject(err);

      if(!user) return reject("User not found!!!");

      resolve({
        _id           : user._id,
        firstName     : user.firstName,
        lastName      : user.lastName,
        email         : user.email,
        roles         : user.roles,
      });
    })

  });
};

userSchema.set('autoIndex', true);

var user = Mongoose.model('user', userSchema);

module.exports = user;