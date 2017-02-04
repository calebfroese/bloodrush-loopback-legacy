var Moment = require('moment');
var internalQuery = require('./../internal-query.js');
var MomentRange = require('moment-range');
var moment = MomentRange.extendMoment(Moment);
/**
 * Fetches all the games on a certain date to be generated and simulated
 */
module.exports = (date, callback) => {
    var today = moment().startOf('day');
    var todayEnd = moment().endOf('day');
    var gamesToday = [];
    internalQuery('get', `/games`, {}, games => {
        games.forEach(game => {
            var range = moment().range(today, todayEnd);
            if (range.contains(moment(game.date))) {
                gamesToday.push(game);
            }
        });
        callback(gamesToday);
    });
}