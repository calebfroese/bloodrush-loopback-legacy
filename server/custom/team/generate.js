'use strict';

var internalQuery = require('./../internal-query.js');
var genPlayer = require('./../player/generate.js');

module.exports = (name, acronym, callback) => {
    // Generare and save a team object
    internalQuery('post', `/teams`, {
        "name": name,
        "acronym": acronym,
        "verified": false,
        "init": false
    }, team => {
        // Generate players belonging to the team
        generatePlayers(team.id);
        // Save the team id to the player

        // Callback the team
        callback(team);
    })


}

function generatePlayers(teamId) {
    // Return an array of team members
    var team = [];
    for (var i = 0; i < 12; i++) {
        var player = genPlayer.createPlayer(teamId);
        // Runs async
        internalQuery('post', `/players`, {
            "first": player.first,
            "last": player.last,
            "atk": player.atk,
            "def": player.def,
            "spd": player.spd,
            "kg": player.kg,
            "rec": player.rec,
            "teamId": teamId
        }, player => { console.log(player); });
    }
    return team;
}