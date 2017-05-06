// "use strict";

var Crypto  = require('crypto');


/***
 * Create bcrypt hash for a string
 * @param str:<required>: string to hash
 * @returns promise->(string)
 */
exports.genHash = function (str) {
  return new Promise(function (resolve, reject) {

    if (!str) {
        return reject('Missing one of required param');
    }

    if (typeof str !== 'string') {
        return reject('Invalid param type');
    }

    resolve(Crypto.createHash('sha256').update(str).digest('base64'));
  });
};

/*
 * compare a string with hash
 * @param str:<required>: to compare with old hash
 * @param hash:<required>: old hashed string
 * @returns promise->(boolean)
 */
exports.compareHash = function (str, hash) {
    return new Promise(function (resolve, reject) {

        if (!str || !hash) {
            return reject('Missing one of required param');
        }

        if (typeof str !== 'string' || typeof hash !== 'string') {
            return reject('Invalid param type');
        }

        resolve(Crypto.createHash('sha256').update(str).digest('base64') === hash);
    });

};
