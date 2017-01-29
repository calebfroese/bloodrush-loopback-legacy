'use strict';

module.exports = function(Game) {
    /**
     * Generates and simulates a game
     */
    Game.generate = function (seasonNumber, gameNumber, cb) {
        console.log('Endpoint generating fgame ', seasonNumber, gameNumber)
        var customGameGenerate = require('./../custom/game/generate.js');
        customGameGenerate.generate(seasonNumber, gameNumber, response => {
            // Save the response to the User
            cb(null, response);
        })
    };
    Game.remoteMethod(
        'generate', {
            http: {
                path: '/generate',
                verb: 'post'
            },
            accepts: [
                {
                    arg: 'seasonNumber',
                    type: 'number',
                    http: { source: 'query' },
                    required: true
                },
                {
                    arg: 'gameNumber',
                    type: 'number',
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
