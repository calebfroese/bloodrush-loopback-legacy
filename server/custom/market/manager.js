var nodeSchedule = require('node-schedule');
var moment = require('moment');

var logging = require('./../../logging.js');
var internalQuery = require('./../internal-query.js');
var econConsts = require('./../../config/economy.constants.js');
var playerGenerate = require('./../player/generate.js');

module.exports =
    {
      init: () => {
        // Initializes the queue for the first time
        logging.info('Initializing the market manager');

        // nodeSchedule.scheduleJob('* * */1 * *', () => {
        logging.info('Market manager is managing default players');
        removeExisting()
            .then(players => {
              console.log(players);
            })
            .catch(err => {
              logging.error(`Unable to manage market players:`);
              console.error(err);
            })
        // });
      }
    }

function
removeExisting() {
  return new Promise((resolve, reject) => {
    var filter = {where: {state: {inq: ['injured', 'market', 'training']}}};
    internalQuery(
        'get', `/players?filter=${JSON.stringify(filter)}`, {}, playersToDelete => {
            playersToDelete.map(player => {
                internalQuery('delete', `/players/${player.id}`, {}, () => { })
            })
            createPlayers()
        })
  });
}

function
createPlayers() {
  // Create some random statted players
  for (var i = 0; i < econConsts.MARKET_DEFAULT_PLAYER_AMT; i++) {
    var player = playerGenerate.createPlayer();
    player.teamId = 'market';
    player.state = 'market';
    player.askingPrice = calculateAskingPrice(player);
    internalQuery('post', `/players`, player, newPlayer => {
      logging.info(`${newPlayer.first
                   } added to the market for ${newPlayer.askingPrice}`);
    });
  }
  // Create some really bad players
  for (var i = 0; i < econConsts.MARKET_DEFAULT_PLAYER_AMT; i++) {
    var player = playerGenerate.createPlayer();
    player.teamId = 'market';
    player.state = 'market';
    player.atk = Math.round(40 + Math.random() * 20);
    player.def = Math.round(40 + Math.random() * 20);
    player.spd = Math.round(40 + Math.random() * 20);
    player.askingPrice = calculateAskingPrice(player);
    internalQuery('post', `/players`, player, newPlayer => {
      logging.info(`${newPlayer.first
                   } added to the market for ${newPlayer.askingPrice}`);
    });
  }
}

function calculateAskingPrice(player) {
    var multiplier = 1;
    var reducer = 1250;
    var worth = (player.atk * player.def * player.spd) / reducer;
    return Math.round(worth);
}