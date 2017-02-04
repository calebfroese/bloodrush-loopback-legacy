var internalQuery = require('./../internal-query.js');

module.exports = (playerId, teamId, callback) => {
  // Get the player up for sale
  internalQuery('get', `/players/${playerId}`, {}, player => {
    internalQuery('get', `/teams/${teamId}`, {}, purchasingTeam => {
      if (purchasingTeam.money > player.askingPrice) {
        // Able to purchase the player
        purchasingTeam.money -= player.askingPrice;
        internalQuery(
            'patch', `/teams/${teamId}`, purchasingTeam, updatedTeam => {
              // The team has been charged by here
              player.teamId = purchasingTeam.id;
              player.state = 'ok';
              internalQuery('post', `/players`, player, savedPlayer => {
                internalQuery('delete', `/players/${playerId}`, {}, () => {});
                callback()
              });
            });
      }
    });
  });
}
