'use strict';

var internalQuery = require('./../internal-query.js');
var childProcess = require('child_process');

var gameConsts = require('./../../config/game.constants.js');
var logging = require('./../../logging.js');

const PLAYERS_PER_TEAM = 8;
const SUBS_PER_TEAM = 4;

module.exports =
    {
      /**
       * Creates the game data for the specified game
       * @param {number} gameId
       */
      generate: (gameId, callback) => {
        // Fetch the game
        var home = null;
        var away = null;
        var playerAttr = {
          x: 280 * 0.35,
          y: 430 * 0.35,
          playerYSpacing: 1.54,  // the y coordinate spacing between players
          visionRadius: 110,
          attackRadius: 50,
          recoveryTime: 7000,  // in seconds
        };
        var gameAttr = {
          speedMultiplier: 28,
          roundDuration: 22000,
          atkBase: 10,
          atkMultiplier: 10,
          fps: 1000 / 33,  // convert fps to milliseconds
        };
        // Set when finding the game details
        var gameFound = null;
        var homePlayers = null;
        var awayPlayers = null;
        fetchGame(gameId)
            .then(g => {
              gameFound = g;
              return fetchTeams(gameFound.homeId, gameFound.awayId);
            })
            .then(teams => {
              // Make sure that there is no bye's
              if (!teams.home || !teams.away) {
                // Don't generate this game! One of the teams is a bye!
                logging.info(`Not generating game ${gameFound.id
                             } as teams were missing/byes`);
                return Promise.reject();
              }
              return new Promise((resolve, reject) => {
                home = [null, teams.home, teams.home, teams.home, teams.home];
                away = [null, teams.away, teams.away, teams.away, teams.away];
                logging.event('Attempting to generate game ' + gameId);

                // Fetch the players for each team
                // HOME
                fetchPlayers(teams.home).then(hp => {
                  homePlayers = removeNotOkPlayers(hp);
                  fetchPlayers(teams.away).then(ap => {
                    awayPlayers = removeNotOkPlayers(ap);
                    resolve(rollForPlayers(homePlayers, awayPlayers));
                  })
                })
                // AWAY
              });
            })
            .then(players => {
              var quarterData = {
                homePlayers: players.homePlayers,
                awayPlayers: players.awayPlayers
              };
              // Patch the quarter with new data
              return patchQuarter(
                         gameFound.id, 1, quarterData,
                         {playerAttr: playerAttr, gameAttr: gameAttr})
                  .then(() => {
                    logging.event(`${gameId} quarter 1 generated`);
                    return rollForPlayers(homePlayers, awayPlayers);
                  })
            })
            .then(players => {
              var quarterData = {
                homePlayers: players.homePlayers,
                awayPlayers: players.awayPlayers
              };
              // Patch the quarter with new data
              return patchQuarter(
                         gameFound.id, 2, quarterData,
                         {playerAttr: playerAttr, gameAttr: gameAttr})
                  .then(() => {
                    logging.event(`${gameId} quarter 2 generated`);
                    return rollForPlayers(homePlayers, awayPlayers);
                  })
            })
            .then(players => {
              var quarterData = {
                homePlayers: players.homePlayers,
                awayPlayers: players.awayPlayers
              };
              // Patch the quarter with new data
              return patchQuarter(
                         gameFound.id, 3, quarterData,
                         {playerAttr: playerAttr, gameAttr: gameAttr})
                  .then(() => {
                    logging.event(`${gameId} quarter 3 generated`);
                    return rollForPlayers(homePlayers, awayPlayers);
                  })
            })
            .then(players => {
              var quarterData = {
                homePlayers: players.homePlayers,
                awayPlayers: players.awayPlayers
              };
              // Patch the quarter with new data
              patchQuarter(gameFound.id, 4, quarterData, {
                playerAttr: playerAttr,
                gameAttr: gameAttr
              }).then(() => {
                logging.event(`${gameId} quarter 4 generated. Done.`);
                childProcess.fork(`runGame.js`, [gameId]);
                callback({ok: true});
              })
            })
            .catch(err => {
              logging.error(err);
              callback({ok: false});
            })
      }
    }

/**
 * Fetches a game depending on the game and season numbers
 */
function fetchGame(gameId) {
  return new Promise((resolve, reject) => {
    internalQuery('get', `/games/${gameId}`, {}, game => {
      resolve(game);
    });
  });
}

/**
 * Fetches the home and away players
 */
function fetchTeams(homeId, awayId) {
  return new Promise((resolve, reject) => {
    // Fetch home team
    internalQuery('get', `/teams/${homeId}`, {}, homeTeam => {
      internalQuery('get', `/teams/${awayId}`, {}, awayTeam => {
        resolve({home: homeTeam, away: awayTeam});
      });
    });
  });
}

/**
 * Plays a game
 */
function fetchPlayers(team) {
  return getPlayerArray(team)
}

function getPlayerArray(team) {
  // Resolves an array of ids to be used
  return new Promise((resolve, reject) => {
    internalQuery('get', `/teams/${team.id}/players`, {}, allPlayersArray => {
      var players = [];
      if (team.playerIdsAtPos && team.playerIdsAtPos.length > 0) {
        for (let i = 0; i < team.playerIdsAtPos.length; i++) {
          allPlayersArray.forEach(player => {
            if (player.id === team.playerIdsAtPos[i] &&
                players.indexOf(player) === -1) {
              players[i] = player;
            }
          });
        }
        allPlayersArray.forEach(player => {
          if (players.indexOf(player) === -1) {
            players.push(player);
          }
        });
      } else {
        players = allPlayersArray;
      }
      resolve(players);
    });
  });
}

function patchQuarter(gameId, qtrNum, quarterData, data) {
  return new Promise((resolve, reject) => {
    internalQuery('get', `/games/${gameId}`, {}, game => {
      game.qtr[qtrNum] = quarterData;
      game.data = data;
      internalQuery('patch', `/games/${gameId}`, game, patchedGame => {
        resolve();
      });
    });
  });
}

function rollForPlayers(homePlayersArray, awayPlayersArray) {
  return new Promise((resolve, reject) => {
    var hPlayers = [];
    var aPlayers = [];

    var hSubPlayers = [];
    var aSubPlayers = [];

    for (var i = 0; i < 12; i++) {
      if (i < 8) {
        if (homePlayersArray[i]) hPlayers[i] = homePlayersArray[i];
        if (awayPlayersArray[i]) aPlayers[i] = awayPlayersArray[i];
      } else {
        if (homePlayersArray[i]) {
          hSubPlayers[i - 8] = homePlayersArray[i];
        }
        if (awayPlayersArray[i]) {
          aSubPlayers[i - 8] = awayPlayersArray[i];
        }
      }
    }

    // Calculate injury and death
    hPlayers = calculateUpset(hPlayers);
    aPlayers = calculateUpset(aPlayers);
    hSubPlayers = calculateUpset(hSubPlayers);
    aSubPlayers = calculateUpset(aSubPlayers);

    hPlayers = calculateInjury(hPlayers);
    aPlayers = calculateInjury(aPlayers);
    hSubPlayers = calculateInjury(hSubPlayers);
    aSubPlayers = calculateInjury(aSubPlayers);


    resolve({
      homePlayers: hPlayers.concat(hSubPlayers),
      awayPlayers: aPlayers.concat(aSubPlayers)
    });
  });
}

/**
 * Calculates the injujry and death rate per player
 * If a player gets knocked down, player.knockdown will
 * determine what happens to them
 */
function calculateInjury(players) {
  for (var i = 0; i < players.length; i++) {
    if (players[i]) {
      // Default knockdown
      players[i].knockdown = 'knockdown';
      var chance = Math.random() * 100;
      // Injury rate
      if (gameConsts.INJURY_RATE >= chance) {
        // Death rate
        if (gameConsts.DEATH_RATE >= chance) {
          // Recieve death
          players[i].knockdown = 'dead';
        } else {
          // Recieve injury
          players[i].knockdown = 'injured';
        }
      } else {
        // Calculate if they will recover
        if (Math.random() * 100 < players[i].rec) {
          players[i].knockdown = 'recover';
        }
      }
    }
  }
  return players;
}

/**
 * Each player has a chance to have a "bad" game
 * This makes sure that the good players arent always winning
 */
function calculateUpset(players) {
  var teamModifier =
      (Math.random() * 0.1 + 0.95);  // the upset for the entire team
  for (var i = 0; i < players.length; i++) {
    var playerModifier = (Math.random() * 0.25 + 0.8);
    if (players[i]) {
      players[i].atk *= playerModifier;
      players[i].def *= playerModifier;
      players[i].atk *= teamModifier;
      players[i].def *= teamModifier;
    }
  }
  return players;
}

/**
 * Makes sure that only players who are in the
 * ok state will play
 */
function removeNotOkPlayers(players) {
  for (var i = 0; i < players.length; i++) {
    if (players[i] && players[i].state !== 'ok') {
      players[i] = null;
    }
  }
  return clean(players);
}

function clean(arr) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] == undefined || arr[i] == null) {
      arr.splice(i, 1);
      i--;
    }
  }
  return arr;
}