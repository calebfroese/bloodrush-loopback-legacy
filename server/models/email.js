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
            cb(null, null);
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

    /**
     * Activate a token (team)
     */
    Email.verifyEmail = function (token, cb) {
        var customEmail = require('./../custom/account/email.js');
        console.log(token);
        customEmail.verifyEmail(token, res => {
            // Update the user to verified
            
            cb(null, res);
        })
    };
    Email.remoteMethod(
        'verifyEmail', {
            http: {
                path: '/verifyEmail',
                verb: 'post'
            },
            accepts: [
                {
                    arg: 'token',
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
