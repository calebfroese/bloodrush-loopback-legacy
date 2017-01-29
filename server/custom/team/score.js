'use strict';

var internalQuery = require('./../internal-query.js');

module.exports = (leagueId, seasonId, teamId, callback) => {
    /**
     * Gets the scores of the teams
     * @param {string} leagueId
     * @param {string} seasonId
     * @param {string} teamId // the team to get scores for
     */
    var responded = false;
    var response = {
        w: 0,
        l: 0,
        t: 0,
        gp: 0
    };
    if (!leagueId || !teamId || !seasonId) {
        callback('No league or season or team specified!');
    }
    // Are we getting a specific season, or just the active season
    // var query = {};
    // if (seasonId) {
    //     query = `?filter={
    //             "leagueId":"${leagueId}",
    //             "seasonId":"${seasonId}"
    //         }`;
    // } else {
    //     // TODO
    //     // query = `?filter={
    //     //         "leagueId":"${leagueId}",
    //     //         "seasonId":"${seasonId}"
    //     //     }`;
    // }
    internalQuery('get', `/seasons/${seasonId}/games`, {}, games => {
        // Iterate through the games to get the scores
        games.forEach(game => {
            if (game.homeId && game.awayId) {
                if (game.homeId === teamId || game.awayId === teamId) {
                    if (game.data.live && game.data.live.isLive === false && game.data.live.quarter === 4) {
                        // Valid game to fetch a score for (is no longer live, but has reached quarter 4 (played through))
                        response.gp++;
                        if (game.homeId === teamId) {
                            // Are the home team
                            if (game.data.live.homeScore > game.data.live.awayScore) {
                                response.w++;
                            } else if (game.data.live.homeScore < game.data.live.awayScore) {
                                response.l++;
                            } else {
                                response.t++;
                            }
                        } else {
                            // Are the away team
                            if (game.data.live.homeScore < game.data.live.awayScore) {
                                response.w++;
                            } else if (game.data.live.homeScore > game.data.live.awayScore) {
                                response.l++;
                            } else {
                                response.t++;
                            }
                        }
                    }
                }
            }
        });
        callback(response);
    })
}