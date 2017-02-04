var moment = require('moment');
var internalQuery = require('./../internal-query.js');
var logging = require('./../../logging.js');
var gameQueue = require('./../game/queue.js');

const IDEAL_TOTAL_GAMES_PLAYED = 26; // season matcher will try to get close to this value of games played (therefore days)
var nextGameDate = moment().add(1, 'minutes');
var roundNumber = 1;
var gameNumber = 1;

module.exports = (leagueId, callback) => {
    roundNumber = 1;
    gameNumber = 1;
    if (!leagueId) callback(new Error('No league id'));
    logging.event('Generating a new season for league ' + leagueId);
    internalQuery('get', `/leagues/${leagueId}`, {}, league => {
        var arrstr = `"` + league.teamIds.join(`","`) + `"`;
        internalQuery('get', `/teams?filter={"where": {"id": {"inq": [${arrstr}]}}}`, {}, teams => {
            // Now we have an array of the teams in teamsArray
            // Generate IDEAL_TOTAL_GAMES_PLAYED rounds
            if (teams.length < 2) {
                logging.warn('Unable to generate season for league ' + leagueId + '. Not enough teams enrolled.');
                callback('Must have at least 2 players registered to a league to start a season');
                return;
            }

            var regularGames = [];
            regularGames = shuffle(createRounds(teams, leagueId));
            var gamesThisSeason = regularGames.length;

            var over;
            var under;
            var use;
            for (var i = 1; i < IDEAL_TOTAL_GAMES_PLAYED; i++) {
                if (i * gamesThisSeason > IDEAL_TOTAL_GAMES_PLAYED) {
                    over = i;
                    break;
                } else {
                    under = i;
                }
            }
            // Should we go over the amount of games, or under, dpeending which is closer
            if (IDEAL_TOTAL_GAMES_PLAYED - (under * gamesThisSeason) > (over * gamesThisSeason) - IDEAL_TOTAL_GAMES_PLAYED) {
                // Use over
                use = over;
            } else {
                use = under;
            }
            for (var i = 1; i < use; i++) {
                regularGames = regularGames.concat(shuffle(createRounds(teams, leagueId)));
            }


            // Fetch the season number
            getSeasonNumber(leagueId)
                .then(seasonNumber => {
                    // Generate playoffs
                    var playoffGames = generatePlayoffs(leagueId, teams.length);
                    var allGames = regularGames.concat(playoffGames);
                    // Add season

                    internalQuery('post', `/seasons?leagueId=${leagueId}`, {
                        "number": seasonNumber,
                        "leagueId": leagueId,
                        "teamIds": league.teamIds
                    }, createdSeason => {
                        // Save to the database
                        allGames.forEach(g => {
                            g.seasonId = createdSeason.id;
                            internalQuery('post', `/games`, g, () => { });
                        })
                        logging.event('Season ' + createdSeason.id + ' generated for league ' + leagueId);
                        // Update the queued games
                        gameQueue.updateTodaysQueue();
                    });
                });
        });
    });
}

function createRounds(teams, leagueId) {
    // Logic from: http://stackoverflow.com/questions/6648512/scheduling-algorithm-for-a-round-robin-tournament
    // Create a round where each player will play everyone else once
    var teamCount = teams.length;
    // If there is an odd number, add a null (which is a bye)
    if (teamCount % 2 === 1) {
        teams.push(null);
        teamCount += 1;
    }

    var gamesArray = [];

    for (var i = 0; i < teamCount - 1; i++) {

        for (var j = 0; j < teamCount / 2; j++) {
            gamesArray.push({
                'leagueId': leagueId,
                'number': gameNumber,
                'homeId': teams[j] ? teams[j].id : null,
                'awayId': teams[teamCount - j - 1] ? teams[teamCount - j - 1].id : null,
                'date': moment(nextGameDate).toDate(),
                'round': roundNumber,
                'data': {},
                'qtr': [null, {}, {}, {}, {}]
            });
            gameNumber++;
        }
        // Move the arrays
        var first = teams[0];
        var last = teams[teamCount - 1];

        teams.splice(-1, 1);
        teams.splice(0, 1);
        teams.unshift(last);
        teams.unshift(first);

        roundNumber++;
        nextGameDate = moment(nextGameDate).add(1, 'day');
    }
    return gamesArray;
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function getSeasonNumber(leagueId) {
    return new Promise((resolve, reject) => {
        internalQuery('get', `/leagues/${leagueId}/seasons`, {}, seasons => {
            var highestNum = 0;
            seasons.forEach(s => {
                if (s.number > highestNum) {
                    highestNum = s.number;
                }
            })
            resolve(highestNum + 1);
        });
    });
}

function generatePlayoffs(leagueId, teamCount) {
    var gamesArray = [];

    // Semi
    if (teamCount >= 8) {
        roundNumber++;
        nextGameDate = moment(nextGameDate).add(1, 'day');
        for (var i = 0; i < 4; i++) {
            var positions = [[1, 8], [4, 5], [3, 6], [2, 7]];
            gamesArray.push({
                'leagueId': leagueId,
                'number': gameNumber,
                'homeId': { 'name': positions[i][0] },
                'awayId': { 'name': positions[i][1] },
                'date': moment(nextGameDate).toDate(),
                'round': roundNumber,
                'tag': 'semi',
                'data': {},
                'qtr': [null, {}, {}, {}, {}]
            });
            gameNumber++;
        }
        roundNumber++;
        nextGameDate = moment(nextGameDate).add(1, 'day');
    }

    // Finals
    if (teamCount >= 4) {
        for (var i = 0; i < 2; i++) {
            var positions = [['semi0', 'semi1'], ['semi2', 'semi3']];
            gamesArray.push({
                'leagueId': leagueId,
                'number': gameNumber,
                'homeId': { 'name': positions[i][0] },
                'awayId': { 'name': positions[i][1] },
                'date': moment(nextGameDate).toDate(),
                'round': roundNumber,
                'tag': 'final',
                'data': {},
                'qtr': [null, {}, {}, {}, {}]
            });
            gameNumber++;
        }
        roundNumber++;
        nextGameDate = moment(nextGameDate).add(1, 'day');
    }

    // Grand final
    if (teamCount >= 2) {
        gamesArray.push({
            'leagueId': leagueId,
            'number': gameNumber,
            'homeId': { 'name': 'final0' },
            'awayId': { 'name': 'final1' },
            'date': moment(nextGameDate).toDate(),
            'round': roundNumber,
            'tag': 'grand',
            'data': {},
            'qtr': [null, {}, {}, {}, {}]
        });
    }

    return gamesArray;
}