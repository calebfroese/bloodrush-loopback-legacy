var nodeSchedule = require('node-schedule');
var moment = require('moment');

var internalQuery = require('./../internal-query.js');

module.exports = {
    updateTodaysQueue: () => {
        console.log('=--------------------------------------------=');
        console.log('Loading the queue the games for today!');
        console.log('=--------------------------------------------=');
        // Found out all the games that need to be played today
        internalQuery('get', `/games/allOnDate`, {}, res => {
            var games = res.games;
            // Filter out byes
            console.log('=--------------------------------------------=');
            console.log('Queued a total of', games.length, 'games');
            games.forEach(game => {
                // Valid game to be ran today! Set it to run at its time
                var min = moment(game.date).minute();
                var hr = moment(game.date).hour();
                var dayOfMonth = moment(game.date).day();
                var month = moment(game.date).month();

                queueGame(game.id, game.date)
                console.log('\n-->', game.id);
                console.log('  >', game.homeId, 'vs', game.awayId);
                console.log('  >', 'At', moment(game.date).format('h:mm:ss a'));
            });
            console.log('\n=--------------------------------------------=');
        });
    }
}

function queueGame(gameId, date) {
    nodeSchedule.scheduleJob(date, function (gId) {
        var generate = require('./custom/game/generate.js');
        generate.generate(gId, () => {
            console.log('Generated game', gId);
        })
    }.bind(null, gameId));
}