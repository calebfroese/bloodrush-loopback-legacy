'use strict';

var logging = require('./../../logging.js');
var config = require('./../config.js');
var internalQuery = require('./../internal-query.js');
var genPlayer = require('./../player/generate.js');

module.exports =
    (access_token, userId, name, acronym, callback) => {
      // Generare and save a team object
      logging.info('Generating a team from user' + userId + ' called ' + name);
      internalQuery(
          'post', `/teams`,
          {'name': name, 'acronym': acronym, 'verified': false, 'init': false},
          team => {
            // Generate players belonging to the team
            generatePlayers(team.id);
            // Save the team to the player
            internalQuery(
                'get', `/Users/${userId}?access_token=${access_token}`, {},
                user => {
                  user.teamId = team.id;
                  logging.info(
                      'Created team ' + team.name + ' with id of ' + team.id);
                  internalQuery(
                      'patch', `/Users/${userId}?access_token=${access_token}`,
                      user, updatedUser => {
                        callback(updatedUser);
                      });
                });
          })


    }

function generatePlayers(teamId) {
  // Return an array of team members
  for (var i = 0; i < config.generateTeamPlayerAmt; i++) {
    var player = genPlayer.createPlayer(teamId);
    // Runs async
    player.teamId = teamId;
    player.state = 'ok';
    internalQuery('post', `/players`, player, () => {});
  }
}