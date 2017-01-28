'use strict';

module.exports = function (Team) {
    /**
      * Send activation email
      */
    Team.generate = function (data, cb) {
        var customTeamGenerate = require('./../custom/team/generate.js');
        console.log('endpoint hit');
        customTeamGenerate(data.access_token, data.userId, data.name, data.acronym, team => {
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
                    type: 'object',
                    http: { source: 'body' },
                    required: true
                }
            ],
            returns: {
                arg: 'data',
                type: 'string'
            }
        }
    );
};
