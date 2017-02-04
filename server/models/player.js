'use strict';

module.exports = function(Player) {
  /**
   * Purchases a player
   */
  Player.purchase = function(playerId, teamId, cb) {
    var playerPurchase = require('./../custom/player/purchase.js');
    playerPurchase(playerId, teamId, res => {
      cb(null, res);
    })
  };
  Player.remoteMethod('purchase', {
    http: {path: '/purchase', verb: 'patch'},
    accepts: [
      {
        arg: 'playerId',
        type: 'string',
        http: {source: 'query'},
        required: true
      },
      {arg: 'teamId', type: 'string', http: {source: 'query'}, required: true}
    ],
    returns: {arg: 'res', type: 'object'}
  });
  /**
   * Purchases a player
   */
  Player.sellForDefault = function(playerId, teamId, cb) {
    var playerSellForDefault = require('./../custom/player/sell-for-default.js');
    playerSellForDefault(playerId, teamId, res => {
      cb(null, res);
    })
  };
  Player.remoteMethod('sellForDefault', {
    http: {path: '/sellForDefault', verb: 'put'},
    accepts: [
      {
        arg: 'playerId',
        type: 'string',
        http: {source: 'query'},
        required: true
      },
      {arg: 'teamId', type: 'string', http: {source: 'query'}, required: true}
    ],
    returns: {arg: 'res', type: 'object'}
  });
};
