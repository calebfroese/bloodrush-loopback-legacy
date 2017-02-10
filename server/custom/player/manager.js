var nodeSchedule = require('node-schedule');
var moment = require('moment');

var generate = require('./generate.js');
var logging = require('./../../logging.js');
var internalQuery = require('./../internal-query.js');

module.exports =
    {
      init: () => {
        // Initializes the queue for the first time
        logging.info('Initializing the player manager');

        // nodeSchedule.scheduleJob('* */1 * * *', () => {
        logging.info('Player manager assigning players');
        findPlayer({where: {state: {inq: ['injured', 'market', 'training']}}})
            .then(players => {
              players.map(player => {
                if (stateEnded(player)) {
                  // The player is no longer in a temp state
                  var oldState = player.state;
                  player.state = 'ok';
                  player.stateEnds = undefined;
                  internalQuery(
                      'patch', `/players/${player.id}`, player, () => {
                        logging.info(`Player ${player.first} ${player
                                         .last} is no longer ${oldState}`);
                      })
                }
              });
            })
            .catch(err => {
              logging.error('Error in player manager:');
              console.error(err);
            })
        // });
      }
    }

function findPlayer(query) {
  return new Promise((resolve, reject) => {
    internalQuery(
        'get', `/players?filter=${JSON.stringify(query)}`, {},
        players => {resolve(players)});
  });
}

function stateEnded(player) {
  if (!player.stateEnds) return false;
  if (moment(player.stateEnds).isBefore(moment())) {
    // Heal this player
    return true;
  }
  return false;
}