'use strict';

var internalQuery = require('./../internal-query.js');
var genPlayer = require('./../player/generate.js');

module.exports = (access_token, userId, name, acronym, callback) => {
    // Generare and save a team object
    console.log('creating team...')
    internalQuery('post', `/teams`, {
        "name": name,
        "acronym": acronym,
        "verified": false,
        "init": false
    }, team => {
        console.log('team creaeed!')
        // Generate players belonging to the team
        generatePlayers(team.id);
        // Save the team to the player
        internalQuery('get', `/Users/${userId}?access_token=${access_token}`, {}, user => {
            user.teamId = team.id;
            console.log('The team belongs to', userId);
            internalQuery('patch', `/Users/${userId}?access_token=${access_token}`, user, updatedUser => {
                console.log('User now owns', team.id);
                callback(updatedUser);
            });
        });
    })


}

function generatePlayers(teamId) {
    // Return an array of team members
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
        }, player => { });
    }
}