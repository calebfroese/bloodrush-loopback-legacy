var internalQuery = require('./../internal-query.js');
var economyConstants = require('./../../config/economy.constants.js');

module.exports = (playerId, teamId, callback) => {
  // Sells the player for the default amount
  internalQuery('delete', `/players/${playerId}`, {}, () => {
    // Give the team their money
    internalQuery('get', `/teams/${teamId}`, {}, team => {
      team.money = team.money + economyConstants.PLAYER_SELL_DEFAULT;
      internalQuery('patch', `/teams/${teamId}`, team, () => {
        callback();
      });
    });
  });
}
