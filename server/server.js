'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var app = module.exports = loopback();
// Custom Requirements
var moment = require('moment');
var multer = require('multer');
var path = require('path');
var cors = require('cors');
var nodeSchedule = require('node-schedule');
var internalQuery = require('./custom/internal-query.js');

app.start = function () {
    // start the web server
    return app.listen(function () {
        app.emit('started');
        var baseUrl = app.get('url').replace(/\/$/, '');
        console.log('Web server listening at: %s', baseUrl);
        if (app.get('loopback-component-explorer')) {
            var explorerPath = app.get('loopback-component-explorer').mountPath;
            console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
        }
    });
};




// Image uploading
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/teamlogos')
    },
    filename: function (req, file, cb) {
        cb(null, req.params.teamId + '.png')
    }
});
var upload = multer({ storage: storage });

app.post('/file/:teamId', upload.any(), (req, res) => {
    if (!req.params.teamId) {
        return;
    }
    res.json(req.files.map(file => {
        var ext = path.extname(file.originalname);
        return {
            originalName: req.params.teamId,
            filename: file.filename
        }
    }));
});

// Serve images out of /public
app.use(loopback.static(__dirname + '/public'));



// Game
nodeSchedule.scheduleJob('0 */5 */1 * * *', () => {
    console.log('=--------------------------------------------=');
    console.log('Queing the games for today!');
    console.log('=--------------------------------------------=');
    // Found out all the games that need to be played today
    internalQuery('get', `/games/allOnDate?date=${moment().format('YYYY/MM/DD')}`, {}, res => {
        let games = res.games;
        // Filter out byes
        games.forEach(game => {
            // Valid game to be ran today! Set it to run at its time
            var min = moment(game.date).minute();
            var hr = moment(game.date).hour();
            var dayOfMonth = moment(game.date).day();
            var month = moment(game.date).month();

            queueGame(game.id, game.date)
        });
    });
});



// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
    if (err) throw err;

    // start the server if `$ node server.js`
    if (require.main === module)
        app.start();
});

function queueGame(gameId, date) {
    nodeSchedule.scheduleJob(date, function (gId) {
        var generate = require('./custom/game/generate.js');
        generate.generate(gId, () => {
            console.log('Generated game', gId);
        })
    }.bind(null, gameId));
}
console.log(nodeSchedule.scheduledJobs);