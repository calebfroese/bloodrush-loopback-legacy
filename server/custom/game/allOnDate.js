var Moment = require('moment');
var internalQuery = require('./../internal-query.js');
var MomentRange = require('moment-range');
var moment = MomentRange.extendMoment(Moment);
/**
 * Fetches all the games on a certain date to be generated and simulated
 */
module.exports = (date, leagueId, callback) => {
  if (date && date !== {} && date !== '{}') {
    var today = moment(date).startOf('day');
    var todayEnd = moment(date).endOf('day');
  } else {
    var today = moment().startOf('day');
    var todayEnd = moment().endOf('day');
  }
  var gamesToday = [];
  var filter = JSON.stringify({where: {leagueId: leagueId}});
  internalQuery('get', `/games?filter={"leagueId": "${leagueId}"}`, {}, games => {
      console.log('found', games.length, `/games?filter={"leagueId": "${leagueId}"}`)
    games.forEach(game => {
      var range = moment().range(today, todayEnd);
      if (range.contains(moment(game.date))) {
        gamesToday.push(game);
      }
    });
    callback(gamesToday);
  });
}