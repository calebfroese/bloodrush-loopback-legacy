'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var app = module.exports = loopback();
// Custom Requirements
var moment = require('moment');
var multer = require('multer');
var path = require('path');
var cors = require('cors');

var internalQuery = require('./custom/internal-query.js');
var gameQueue = require('./custom/game/queue.js');

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

// Load the initial queued games
gameQueue.updateTodaysQueue();

// Serve images out of /public
app.use(loopback.static(__dirname + '/public'));

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
    if (err) throw err;

    // start the server if `$ node server.js`
    if (require.main === module)
        app.start();
});
