'use strict';

module.exports = function(Game) {
  /**
   * Generates and simulates a game
   */
  Game.generate = function(gameId, cb) {
    var customGameGenerate = require('./../custom/game/generate.js');
    customGameGenerate.generate(gameId, response => {
      // Save the response to the User
      cb(null, response);
    })
  };
  Game.remoteMethod('generate', {
    http: {path: '/generate', verb: 'post'},
    accepts: [
      {arg: 'gameId', type: 'string', http: {source: 'query'}, required: true}
    ],
    returns: {arg: 'response', type: 'string'}
  });

  /**
   * Simulates a game
   */
  Game.simulate = function(gameId, cb) {
    var customGameSimulate = require('./../custom/game/simulate.js');
    customGameSimulate.simulate(gameId);
    cb(null, {ok: true});
  };
  Game.remoteMethod('simulate', {
    http: {path: '/simulate', verb: 'post'},
    accepts: [
      {arg: 'gameId', type: 'string', http: {source: 'query'}, required: true}
    ],
    returns: {arg: 'response', type: 'object'}
  });

  /**
   * Returns all games to be played today
   */
  Game.allOnDate = function(date, cb) {
    var allOnDate = require('./../custom/game/allOnDate.js');
    allOnDate(date, response => {
      cb(null, response);
    })
  };
  Game.remoteMethod('allOnDate', {
    http: {path: '/allOnDate', verb: 'get'},
    accepts: [
      {arg: 'date', type: 'string', http: {source: 'query'}, required: false}
    ],
    returns: {arg: 'games', type: 'any'}
  });
};
