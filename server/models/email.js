'use strict';

module.exports = function (Email) {
    /**
     * Send activation email
     */
    Email.sendActivation = function (email, teamId, cb) {
        var customEmail = require('./../custom/account/email.js');
        console.log(email, teamId);
        customEmail.signup(email, teamId, token => {
            // Save the token to the User

            cb(null, token);
        })
    };
    Email.remoteMethod(
        'sendActivation', {
            http: {
                path: '/sendActivation',
                verb: 'post'
            },
            accepts: [
                {
                    arg: 'email',
                    type: 'string',
                    http: { source: 'query' },
                    required: true
                },
                {
                    arg: 'teamId',
                    type: 'string',
                    http: { source: 'query' },
                    required: true
                }
            ],
            returns: {
                arg: 'token',
                type: 'string'
            }
        }
    );
};
