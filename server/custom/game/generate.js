'use strict';

var internalQuery = require('./../internal-query.js');
var childProcess = require('child_process');

const PLAYERS_PER_TEAM = 8;
const SUBS_PER_TEAM = 4;

module.exports = {
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
            playerYSpacing: 1.54, // the y coordinate spacing between players
            visionRadius: 100,
            attackRadius: 30,
            recoveryTime: 7000, // in seconds
        };
        var gameAttr = {
            speedMultiplier: 28,
            roundDuration: 26000,
            atkBase: 10,
            atkMultiplier: 10,
            fps: 1000 / 33, // convert fps to milliseconds
        };
        // Set when finding the game details
        var gameFound = null;
        var homePlayers = null;
        var awayPlayers = null;
        fetchGame(gameId)
            .then(g => {
                gameFound = g;
                console.log('Game has been found', gameFound)
                return fetchTeams(gameFound.homeId, gameFound.awayId);
            })
            .then(teams => {
                // Make sure that there is no bye's
                if (!teams.home || !teams.away) {
                    // Don't generate this game! One of the teams is a bye!
                    return Promise.reject();
                }
                return new Promise((resolve, reject) => {
                    home = [null, teams.home, teams.home, teams.home, teams.home];
                    away = [null, teams.away, teams.away, teams.away, teams.away];
                    console.log('TEAMS FOUND', teams.home.name, 'vs', teams.away.name)

                    // Fetch the players for each team
                    // HOME
                    fetchPlayers(teams.home).then(hp => {
                        console.log('home is', hp);
                        homePlayers = hp;
                        fetchPlayers(teams.away).then(ap => {
                            awayPlayers = ap;
                            resolve(rollForPlayers(homePlayers, awayPlayers));
                        })
                    })
                    // AWAY
                });
            })
            .then(players => {
                var quarterData = { homePlayers: players.homePlayers, awayPlayers: players.awayPlayers };
                // Patch the quarter with new data
                return patchQuarter(gameFound.id, 1, quarterData, { playerAttr: playerAttr, gameAttr: gameAttr })
                    .then(() => {
                        return rollForPlayers(homePlayers, awayPlayers);
                    })
            })
            .then(players => {
                var quarterData = { homePlayers: players.homePlayers, awayPlayers: players.awayPlayers };
                // Patch the quarter with new data
                return patchQuarter(gameFound.id, 2, quarterData, { playerAttr: playerAttr, gameAttr: gameAttr })
                    .then(() => {
                        return rollForPlayers(homePlayers, awayPlayers);
                    })
            })
            .then(players => {
                var quarterData = { homePlayers: players.homePlayers, awayPlayers: players.awayPlayers };
                // Patch the quarter with new data
                return patchQuarter(gameFound.id, 3, quarterData, { playerAttr: playerAttr, gameAttr: gameAttr })
                    .then(() => {
                        return rollForPlayers(homePlayers, awayPlayers);
                    })
            })
            .then(players => {
                var quarterData = { homePlayers: players.homePlayers, awayPlayers: players.awayPlayers };
                // Patch the quarter with new data
                patchQuarter(gameFound.id, 4, quarterData, { playerAttr: playerAttr, gameAttr: gameAttr })
                    .then(() => {
                        childProcess.fork(`runGame.js`, [gameId])
                        callback({ ok: true });
                    })
            })
            .catch(err => {
                console.log('ERROR');
                console.log(err);
                callback({ ok: false });
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
                resolve({ home: homeTeam, away: awayTeam });
            });
        });
    });
}

/**
 * Plays a game
 */
function fetchPlayers(team) {
    return getPlayerArray(team).then(playerIdsAtPos => {
        console.log('using array of players', playerIdsAtPos)
        return new Promise((resolve, reject) => {
            internalQuery('get', `/teams/${team.id}/players`, {}, allPlayersArray => {
                var players = [];
                for (let i = 0; i < playerIdsAtPos.length; i++) {
                    allPlayersArray.forEach(player => {
                        if (player.id === playerIdsAtPos[i]) {
                            players[i] = player;
                        }
                    });
                }
                setTimeout(() => {
                    console.log(players);
                    console.log('is the team players in order');
                    resolve(players);
                }, 2500);
            });
        });
    }).catch(err => {
        console.error(err);
        return Promise.reject();
    });
}

function getPlayerArray(team) {
    console.log('getPlayerArray')
    // Resolves an array of ids to be used
    return new Promise((resolve, reject) => {
        if (team.playerIdsAtPos && team.playerIdsAtPos.length > 0) {
            console.log('resolving with saved ids of', team.playerIdsAtPos)
            resolve(playerIdsAtPos);
        } else {
            var playerIdsArray = [];
            internalQuery('get', `/teams/${team.id}/players`, {}, allPlayersArray => {
                allPlayersArray.forEach(p => {
                    playerIdsArray.push(p.id);
                })
                console.log('resolving with default ids of', playerIdsArray)
                resolve(playerIdsArray);
            });
        }
    });
}

function patchQuarter(gameId, qtrNum, quarterData, data) {
    return new Promise((resolve, reject) => {
        internalQuery('get', `/games/${gameId}`, {}, game => {
            game.qtr[qtrNum] = quarterData;
            game.data = data;
            console.log((game.qtr['1'] !== null));
            console.log((game.qtr['2'] !== null));
            console.log((game.qtr['3'] !== null));
            console.log((game.qtr['4'] !== null));
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
                if (homePlayersArray[i]) hSubPlayers[i] = homePlayersArray[i];
                if (awayPlayersArray[i]) aSubPlayers[i] = awayPlayersArray[i];
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

        resolve({ homePlayers: hPlayers.concat(hSubPlayers), awayPlayers: aPlayers.concat(aSubPlayers) });
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
            if (17 - players[i].rec * 0.1 > chance) {
                // Death rate
                if (5 - players[i].rec * 0.1 > chance) {
                    // Recieve death
                    players[i].knockdown = 'death';
                } else {
                    // Recieve injury
                    players[i].knockdown = 'injury';
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
    var teamModifier = (Math.random() * 0.1 + 0.95); // the upset for the entire team
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
