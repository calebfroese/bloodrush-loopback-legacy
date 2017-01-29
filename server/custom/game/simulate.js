var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var fs = require('fs');
var mongo = require('./../../mongo/mongo.js');

module.exports = {
    simulate: (sId, gId) => {
        console.log('Starting season', sId, 'game', gId);
        // Simulates an entire game so that player injury/death and score can be told
        mongo.query('seasons', 'oneByNumber', { number: sId }, s => {
            // Get teams
            mongo.query('teams', 'oneById', { _id: s.games[gId].home }, h => {
                home = h;
                mongo.query('teams', 'oneById', { _id: s.games[gId].away }, a => {
                    away = a;
                    ngOnInit(s, home, away, gId);
                });
            });
        });
    }
}

// Params
var gameId;
var season;
var seasonNumber;
// Teams
var home; // original unmodified team
var away; // original unmodified team
var game; // the game object "game": { "data": {}, "round": Date(), etc}
// Game data
var data; // additional game data
var homePos = [];
var awayPos = [];
var calcEndPoint = 0;
var homeScore = 0;
var awayScore = 0;
var timeStart = 0;
var timeCurrent = 0;
var timeElapsed = 0;
var timeNextRound = null;
var qtr;
var cachedQtrNum = qtrNum;
var qtrDeadInjArray = { home: [], away: [] }; // arrays of injured/dead players to be replaced
var qtrNum = 0; // round number

var images = {};
// Scaling
var maxWidth = 1152;
var maxHeight = 822;

function ngOnInit(seas, teamHome, teamAway, gId) {
    // Fetch the season
    season = seas;
    gameId = gId;
    seasonNumber = seas.number;
    game = seas.games[gameId];
    data = seas.games[gameId].data;
    if (game && season.games[gameId].round && season.games[gameId].qtr[1].homePlayers) {
        pushData({ isLive: true, quarter: 1, homeScore: 0, awayScore: 0 });
        initializeGame();
    } else {
        console.error('GAME HAS NOT YET BEEN RAN!!! ERR');
    }
}

function pushData(live) {
    // Update the game object
    console.log('pushData');
    MongoClient.connect('mongodb://localhost:27017/bloodrush', (err, db) => {
        if (err) {
            throw err
            console.log('pushData:err');
        }
        console.log('game', gameId, 'quarter', live.quarter, '. home', home.name, 'vs', away.name);
        var mySet = {};
        mySet['games.' + gameId + '.data.live'] = live;

        console.log('pushData:about to update');
        db.collection('seasons').update({ number: seasonNumber }, { "$set": mySet }, { upsert: false, multi: false });
        console.log('pushData:updated');
        db.close();
        console.log('pushData:closed');
    });
    console.log('pushData:done');
}

function playerEvent(playerId) {
    // MongoClient.connect('mongodb://localhost:27017/bloodrush', (err, db) => {
    //     if (err) throw err
    //     db.collection('teams').find({  }, (err, doc) => {
    //         console.log(doc);
    //     });
    // });
}

function initializeGame() {
    // This will start the game playing
    initializePlayers();
    checkRoundEnd();
    redrawCanvas();
}

function initializePlayers() {
    data = season.games[gameId].data;
    qtr = season.games[gameId].qtr;
    for (var i = 0; i < 8; i++) {
        for (var j = 1; j <= 4; j++) {
            if (qtr[j].homePlayers[i])
                qtr[j].homePlayers[i].scored = { qtr1: false, qtr2: false, qtr3: false, qtr4: false };
            if (qtr[j].awayPlayers[i])
                qtr[j].awayPlayers[i].scored = { qtr1: false, qtr2: false, qtr3: false, qtr4: false };
        }
    }
    for (var i = 8; i < 12; i++) {
        for (var j = 1; j <= 4; j++) {
            if (qtr[j].homePlayers[i])
                qtr[j].homePlayers[i].scored = { qtr1: false, qtr2: false, qtr3: false, qtr4: false };
            if (qtr[j].awayPlayers[i])
                qtr[j].awayPlayers[i].scored = { qtr1: false, qtr2: false, qtr3: false, qtr4: false };
        }
    }
}

function newRound() {
    replaceWithSub();
    // Calculate end point
    calcEndPoint = maxWidth - data.playerAttr.x;
    // Generate player positions
    homePos = [];
    awayPos = [];
    for (var i = 0; i < 8; i++) {
        homePos.push({ x: 0, y: (data.playerAttr.y / data.playerAttr.playerYSpacing) * i, r: 0, recalc: 0, targetIndex: i, frame: 1, framecalc: 0 });
        awayPos.push({ x: calcEndPoint, y: (data.playerAttr.y / data.playerAttr.playerYSpacing) * i, r: 0, recalc: 0, targetIndex: i, frame: 1, framecalc: 0 });
    }
    timeCurrent = timeElapsed = timeStart = timeNextRound = 0;
    qtrNum++;
    cachedQtrNum = qtrNum;

}

var pushedQuarter4 = false;
function checkRoundEnd() {
    if (timeCurrent >= timeNextRound || !timeNextRound) {
        // Data stuff
        if (qtrNum === 4 && !pushedQuarter4) {
            pushedQuarter4 = true;
            pushData({ isLive: false, quarter: qtrNum, homeScore: homeScore, awayScore: awayScore });
        } else if (qtrNum > 0 && qtrNum < 4) {
            pushData({ isLive: true, quarter: qtrNum, homeScore: homeScore, awayScore: awayScore });
        }
        // Timer and new round stuff
        if (qtrNum < 4) {
            newRound();
            timeNextRound = timeCurrent + data.gameAttr.roundDuration;
        }
    }
}

function redrawCanvas() {
    if (cachedQtrNum !== qtrNum) {
        return;
    }
    var homePlayers = qtr[qtrNum].homePlayers;
    var awayPlayers = qtr[qtrNum].awayPlayers;

    // Draw the home players
    for (var i = 0; i < 8; i++) {
        if (homePlayers[i]) {
            var downText = Math.round(homePlayers[i].kg);
            if (homePlayers[i].down) {
                calculateRecovery('home', i);
                downText = homePlayers[i].knockdown;
            }
            homePos[i] = playerLogic(homePos[i], 'home', i);
        }
    }
    // Draw the away players
    for (var i = 0; i < 8; i++) {
        if (awayPlayers[i]) {
            var downText = Math.round(awayPlayers[i].kg);
            if (awayPlayers[i].down) {
                calculateRecovery('away', i);
                downText = awayPlayers[i].knockdown;
            }
            awayPos[i] = playerLogic(awayPos[i], 'away', i);
        }
    }
    // Update time
    timeElapsed = timeCurrent - timeStart;

    setTimeout(() => {
        timeCurrent += data.gameAttr.fps;
        checkRoundEnd();
        redrawCanvas();
    }, data.gameAttr.fps);
}

function playerLogic(playerPos, team, i) {
    /**
     * Calculates the player logic
     * @param {x, y, r} playerPos
     * @param {string} team // home or away
     * @param {number} i // player index in array e.g. homePlayers[i]
     */
    var oTeam = (team === 'home') ? 'away' : 'home'; // other team
    var teamPlayers = qtr[qtrNum][team + 'Players'];
    var oPlayers = qtr[qtrNum][oTeam + 'Players'];
    var oPos = (team === 'home') ? awayPos : homePos;
    if (!teamPlayers[i]) return;
    // If down or scored
    if (teamPlayers[i].kg <= 0 || teamPlayers[i].scored['qtr' + qtrNum]) return playerPos;
    // Run through to find the closest enemy
    if (timeElapsed > playerPos.recalc && !oPlayers[i] || timeElapsed > playerPos.recalc && oPlayers[i].down) {
        var lowestC = 1000000000; // unreasonably higher number that any player will be closer than
        playerPos.targetIndex = null;
        for (var x = 0; x < 8; x++) {
            if (oPlayers[x] && oPlayers[x].kg > 0) {
                var a = playerPos.x - oPos[x].x;
                var b = playerPos.y - oPos[x].y;
                var c = Math.sqrt(a * a + b * b);
                if (c < lowestC && c < data.playerAttr.visionRadius) {
                    lowestC = c;
                    playerPos.targetIndex = x;
                }
            }
        }
        // Reset the timer until next recalculation of target
        playerPos.recalc = timeElapsed + 100;
    }
    // If the player's target has scored/injured/dead, remove them as the target
    if (!oPlayers[playerPos.targetIndex] || playerPos.targetIndex && oPlayers[playerPos.targetIndex].scored['qtr' + qtrNum] === true) {
        playerPos.targetIndex = null;
    }

    if (playerPos.targetIndex !== null && oPos[playerPos.targetIndex] && oPlayers[playerPos.targetIndex] && !oPlayers[playerPos.targetIndex].down) {
        // Target is alive, check if nearby enough to attack
        var a = playerPos.x - oPos[playerPos.targetIndex].x;
        var b = playerPos.y - oPos[playerPos.targetIndex].y;
        var c = Math.sqrt(a * a + b * b);

        if (c <= data.playerAttr.attackRadius) {
            // ATTACK THE ENEMY
            if (timeElapsed > playerPos.atkTime || !playerPos.atkTime) {
                var genNextTime = 800 + parseInt(Math.round(timeCurrent * playerPos.x).toString().substr(0, 2));
                playerPos.atkTime = timeElapsed + genNextTime + teamPlayers[i].spd;
                qtr[qtrNum][oTeam + 'Players'][playerPos.targetIndex].kg -= data.gameAttr.atkBase + (teamPlayers[i].atk / oPlayers[playerPos.targetIndex].def) * data.gameAttr.atkMultiplier;
                if (qtr[qtrNum][oTeam + 'Players'][playerPos.targetIndex].kg <= 0) {
                    qtr[qtrNum][oTeam + 'Players'][playerPos.targetIndex].down = true;
                }
            }
        } else {
            // MOVE TOWARDS ENEMY

            // Calculate direction towards player
            var calcX = oPos[playerPos.targetIndex].x - playerPos.x;
            var calcY = oPos[playerPos.targetIndex].y - playerPos.y;

            // Normalize
            var toEnemyLength = Math.sqrt(calcX * calcX + calcY * calcY);
            calcX = calcX / toEnemyLength;
            calcY = calcY / toEnemyLength;

            // Move towards the enemy
            playerPos.x += (calcX * teamPlayers[i].spd) / data.gameAttr.speedMultiplier;
            playerPos.y += (calcY * teamPlayers[i].spd) / data.gameAttr.speedMultiplier;

            // Rotate us to face the player
            playerPos.r = Math.atan2(calcY, calcX);
        }
    } else {
        // MOVE TO END field
        var moveDirection = (team === 'home') ? 1 : -1;
        if (playerPos.x >= calcEndPoint && moveDirection === 1 ||
            playerPos.x <= 0 && moveDirection === -1) {
            qtr[qtrNum][team + 'Players'][i].scored['qtr' + qtrNum] = true;
            if (team === 'home') homeScore++;
            if (team === 'away') awayScore++;
            pushData({ isLive: true, quarter: qtrNum, homeScore: homeScore, awayScore: awayScore });
        } else {
            playerPos.x += (teamPlayers[i].spd / data.gameAttr.speedMultiplier) * moveDirection;
        }
    }
    // Graphics
    if (timeElapsed > playerPos.framecalc) {
        playerPos.framecalc = timeElapsed + 100;
        if (playerPos.frame === 1) {
            playerPos.frame = 4;
        } else if (playerPos.frame === 4) {
            playerPos.frame = 7;
        } else if (playerPos.frame === 7) {
            playerPos.frame = 7.4;
        } else if (playerPos.frame === 7.4) {
            playerPos.frame = 1;
        }
    }
    return playerPos;
}

function calculateRecovery(team, playerIndex) {
    if (cachedQtrNum !== qtrNum) {
        return;
    }
    var homePlayers = qtr[qtrNum].homePlayers;
    var awayPlayers = qtr[qtrNum].awayPlayers;

    var recoveryTime = data.playerAttr.recoveryTime;

    if (team === 'home') {
        // Home team
        if (homePlayers[playerIndex].knockdown === 'recover') {
            setTimeout(() => {
                homePlayers[playerIndex].down = false;
                homePlayers[playerIndex].kg = homePlayers[playerIndex].def / 6; // give hp back
            }, recoveryTime);
        } else if (homePlayers[playerIndex].knockdown === 'injury') {
            qtrDeadInjArray.home.push(playerIndex)
        } else if (homePlayers[playerIndex].knockdown === 'death') {
            qtrDeadInjArray.home.push(playerIndex)
        }
        homePlayers[playerIndex].knockdown = 'knockdown';
    } else {
        // Away team
        if (awayPlayers[playerIndex].knockdown === 'recover') {
            setTimeout(() => {
                awayPlayers[playerIndex].down = false;
                awayPlayers[playerIndex].kg = awayPlayers[playerIndex].def / 6; // give hp back
            }, recoveryTime);
        } else if (awayPlayers[playerIndex].knockdown === 'injury') {
            qtrDeadInjArray.away.push(playerIndex)
        } else if (awayPlayers[playerIndex].knockdown === 'death') {
            qtrDeadInjArray.away.push(playerIndex)
        }
        awayPlayers[playerIndex].knockdown = 'knockdown';
    }
}

function replaceWithSub() {
    // Remove the local player in the game object
    // Iterate for each game quarter
    for (var needReplaceIndexC = 0; needReplaceIndexC < qtrDeadInjArray.home.length; needReplaceIndexC++) {
        // Replace out the unable to play player
        qtr[1].homePlayers[qtrDeadInjArray.home[needReplaceIndexC]] = null;
        qtr[2].homePlayers[qtrDeadInjArray.home[needReplaceIndexC]] = null;
        qtr[3].homePlayers[qtrDeadInjArray.home[needReplaceIndexC]] = null;
        qtr[4].homePlayers[qtrDeadInjArray.home[needReplaceIndexC]] = null;
        for (var k = 8; k < 12; k++) {
            if (qtr[1].homePlayers[k] && qtrDeadInjArray.home[needReplaceIndexC]) {
                qtr[1].homePlayers[qtrDeadInjArray.home[needReplaceIndexC]] = qtr[1].homePlayers[k];
                qtr[2].homePlayers[qtrDeadInjArray.home[needReplaceIndexC]] = qtr[2].homePlayers[k];
                qtr[3].homePlayers[qtrDeadInjArray.home[needReplaceIndexC]] = qtr[3].homePlayers[k];
                qtr[4].homePlayers[qtrDeadInjArray.home[needReplaceIndexC]] = qtr[4].homePlayers[k];
                qtr[1].homePlayers[k] = qtrDeadInjArray.home[needReplaceIndexC] = null;
            }
        }
    }
    for (var needReplaceIndexC = 0; needReplaceIndexC < qtrDeadInjArray.away.length; needReplaceIndexC++) {
        // Replace out the unable to play player
        qtr[1].awayPlayers[qtrDeadInjArray.away[needReplaceIndexC]] = null;
        qtr[2].awayPlayers[qtrDeadInjArray.away[needReplaceIndexC]] = null;
        qtr[3].awayPlayers[qtrDeadInjArray.away[needReplaceIndexC]] = null;
        qtr[4].awayPlayers[qtrDeadInjArray.away[needReplaceIndexC]] = null;
        for (var k = 8; k < 12; k++) {
            if (qtr[1].awayPlayers[k] && qtrDeadInjArray.away[needReplaceIndexC]) {
                qtr[1].awayPlayers[qtrDeadInjArray.away[needReplaceIndexC]] = qtr[1].awayPlayers[k];
                qtr[2].awayPlayers[qtrDeadInjArray.away[needReplaceIndexC]] = qtr[2].awayPlayers[k];
                qtr[3].awayPlayers[qtrDeadInjArray.away[needReplaceIndexC]] = qtr[3].awayPlayers[k];
                qtr[4].awayPlayers[qtrDeadInjArray.away[needReplaceIndexC]] = qtr[4].awayPlayers[k];
                qtr[1].awayPlayers[k] = qtrDeadInjArray.away[needReplaceIndexC] = null;
            }
        }
    }
    qtrDeadInjArray = { home: [], away: [] };
}
