var nodeSchedule = require('node-schedule');
var moment = require('moment');

var logging = require('./../../logging.js');
var internalQuery = require('./../internal-query.js');

module.exports =
    {
      init: () => {
        // Initializes the queue for the first time
        logging.info('Initializing the player manager');

        managePlayers();
        nodeSchedule.scheduleJob(
            `playerManager.refreshPlayers`, '*/7 * * * *', () => {
              managePlayers();
            });
      }
    }

function
managePlayers() {
  logging.info('Player manager is managing states');
  findPlayer({where: {state: {inq: ['injured', 'market', 'training']}}})
      .then(players => {
        logging.info(
            'Player manager fetched ' + players.length +
            ' players with stateEnds');
        players.forEach(player => {
          if (stateEnded(player)) {
            // The player is no longer in a temp state
            var oldState = player.state;
            player.state = 'ok';
            player.stateEnds = undefined;
            internalQuery('patch', `/players/${player.id}`, player, () => {
              logging.info(`Player ${player.first} ${player.last
                           } is no longer ${oldState}`);
            })
          }
        });
      })
      .catch(err => {
        logging.error('Error in player manager:');
        logging.error(err);
      })
}

function findPlayer(query) {
  return new Promise((resolve, reject) => {
    internalQuery(
        'get',
        `/players?filter={"where": {"state": {"inq": ["injured", "market", "training"]}}}`,
        {}, players => {resolve(players)});
  });
}

function stateEnded(player) {
  if (!player.stateEnds) return false;
  if (moment().isAfter(player.stateEnds)) return true;
  return false;
}