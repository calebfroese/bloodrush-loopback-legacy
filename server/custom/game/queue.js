var nodeSchedule = require('node-schedule');
var moment = require('moment');

var generate = require('./generate.js');
var logging = require('./../../logging.js');
var internalQuery = require('./../internal-query.js');

module.exports = {
    updateTodaysQueue: () => {
        // Found out all the games that need to be played today
        internalQuery('get', `/games/allOnDate`, {}, res => {
            var games = res.games;
            // Filter out byes
            logging.event('Queued a total of ' + games.length + ' games');
            games.forEach(game => {
                // Valid game to be ran today! Set it to run at its time
                var min = moment(game.date).minute();
                var hr = moment(game.date).hour();
                var dayOfMonth = moment(game.date).day();
                var month = moment(game.date).month();

                queueGame(game.id, game.date)
                logging.event('>>> ' + game.id + ' @ ' + moment(game.date).format('h:mm:ss a'));
                logging.event('    ' + game.homeId + ' vs ' + game.awayId);
            });
        });
    }
}

function queueGame(gameId, date) {
    nodeSchedule.scheduleJob(date, function (gId) {
        generate.generate(gId, () => {
            logging.event('Generated game ' + gId);
        })
    }.bind(null, gameId));
}