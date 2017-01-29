'use strict';

module.exports = function(Game) {
    /**
     * Generates and simulates a game
     */
    Game.generate = function (gameId, cb) {
        console.log('Endpoint generating fgame ', gameId)
        var customGameGenerate = require('./../custom/game/generate.js');
        customGameGenerate.generate(gameId, response => {
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
                    arg: 'gameId',
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
