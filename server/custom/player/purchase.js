var internalQuery = require('./../internal-query.js');

module.exports = (playerId, teamId, callback) => {
  // Get the player up for sale
  internalQuery('get', `/players/${playerId}`, {}, player => {
    var originalTeamId = player.teamId;
    var askingPrice = player.askingPrice
    internalQuery('get', `/teams/${teamId}`, {}, purchasingTeam => {
      if (purchasingTeam.money > player.askingPrice) {
        // Able to purchase the player
        purchasingTeam.money -= askingPrice;
        internalQuery(
            'patch', `/teams/${teamId}`, purchasingTeam, updatedTeam => {
              // The team has been charged by here
              player.teamId = purchasingTeam.id;
              player.state = 'ok';
              internalQuery('delete', `/players/${playerId}`, {}, () => {
                internalQuery('post', `/players`, player, savedPlayer => {
                  if (originalTeamId !== 'market') {
                    internalQuery(
                        'get', `/teams/${originalTeamId}`, {}, originalTeam => {
                          originalTeam.money += askingPrice;
                          internalQuery(
                              'patch', `/teams/${originalTeamId}`, originalTeam,
                              () => {callback()});
                        });
                  } else {
                    callback();
                  }
                });
              });
            });
      }
    });
  });
}
