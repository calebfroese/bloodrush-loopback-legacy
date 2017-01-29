'use strict';

module.exports = function (Team) {
    /**
      * Send activation email
      */
    Team.generate = function (data, cb) {
        console.log('data is', data);
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

    /**
     * Fetching the score
     */
    Team.score = function (leagueId, seasonId, teamId, cb) {
        var customTeamScore = require('./../custom/team/score.js');
        console.log('endpoint hit');
        customTeamScore(leagueId, seasonId, teamId, score => {
            cb(null, score);
        });
    };
    Team.remoteMethod(
        'score', {
            http: {
                path: '/score',
                verb: 'get'
            },
            accepts: [
                {
                    arg: 'leagueId',
                    type: 'string',
                    http: { source: 'query' },
                    required: true
                },
                {
                    arg: 'seasonId',
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
                arg: 'score',
                type: 'object'
            }
        }
    );
};
