'use strict';

module.exports = function(Player) {
    /**
     * Purchases a player
     */
    Player.purchase = function (playerId, teamId, cb) {
        var playerPurchase = require('./../custom/player/purchase.js');
        playerPurchase(playerId, teamId, res => {
            // Save the token to the User
            cb(null, res);
        })
    };
    Player.remoteMethod(
        'purchase', {
            http: {
                path: '/purchase',
                verb: 'patch'
            },
            accepts: [
                {
                    arg: 'playerId',
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
                arg: 'res',
                type: 'object'
            }
        }
    );
};
