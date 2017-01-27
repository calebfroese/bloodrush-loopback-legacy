'use strict';

module.exports = function (Email) {
    /**
     * Send activation email
     */
    Email.sendActivation = function (cb) {
        var email = require('./../custom/account/email.js');
        email.signup('caleb.froese@gmail.com', 'TEANAME', token => {
            cb(null, token);
        })
    };
    Email.remoteMethod(
        'sendActivation', {
            http: {
                path: '/sendActivation',
                verb: 'post'
            },
            returns: {
                arg: 'token',
                type: 'string'
            }
        }
    );
};
