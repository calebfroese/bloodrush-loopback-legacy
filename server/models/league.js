'use strict';

module.exports = function(League) {
    /**
     * Send activation email
     */
    League.generateSeason = function (id, cb) {
        var customLeagueGenerate = require('./../custom/league/generate.js');
        customLeagueGenerate(id, response => {
            // Save the token to the User
            cb(null, response);
        })
    };
    League.remoteMethod(
        'generateSeason', {
            http: {
                path: '/generateSeason',
                verb: 'post'
            },
            accepts: [
                {
                    arg: 'id',
                    type: 'string',
                    http: { source: 'query' },
                    required: true
                }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
};
