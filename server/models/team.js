'use strict';

module.exports = function (Team) {
    /**
      * Send activation email
      */
    Team.generate = function (data, cb) {
        var customTeamGenerate = require('./../custom/team/generate.js');
        customTeamGenerate(data.name, data.acronym, team => {
            cb(null, team);
        });
    };
    Team.remoteMethod(
        'generate', {
            http: {
                path: '/generate',
                verb: 'post'
            },
            accepts: [
                {
                    arg: 'data',
                    type: 'json',
                    http: { source: 'body' },
                    required: true
                }
            ],
            returns: {
                arg: 'players',
                type: 'string'
            }
        }
    );
};
