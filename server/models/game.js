'use strict';

module.exports = function (Game) {
    /**
     * Generates and simulates a game
     */
    Game.generate = function (gameId, cb) {
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

    /**
     * Returns all games to be played today
     */
    Game.allOnDate = function (date, cb) {
        var allOnDate = require('./../custom/game/allOnDate.js');
        allOnDate(date, response => {
            cb(null, response);
        })
    };
    Game.remoteMethod(
        'allOnDate', {
            http: {
                path: '/allOnDate',
                verb: 'get'
            },
            accepts: [
                {
                    arg: 'date',
                    type: 'string',
                    http: { source: 'query' },
                    required: false
                }
            ],
            returns: {
                arg: 'games',
                type: 'any'
            }
        }
    );
};
