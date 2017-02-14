'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var app = module.exports = loopback();
// Custom Requirements
var moment = require('moment');
var multer = require('multer');
var path = require('path');
var cors = require('cors');
var morgan = require('morgan');
var fs = require('fs');
var rfs = require('rotating-file-stream');

var logging = require('./logging.js');
var internalQuery = require('./custom/internal-query.js');
var gameQueue = require('./custom/game/queue.js');
var playerManager = require('./custom/player/manager.js');
var marketManager = require('./custom/market/manager.js');

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    logging.info('Web server listening at: ' + baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      logging.info('Browse your REST API at ' + baseUrl + explorerPath);
    }
  });
};

// Image uploading
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/teamlogos')
  },
  filename: function(req, file, cb) {
    cb(null, req.params.teamId + '.png')
  }
});
var upload = multer({storage: storage});

app.post('/file/:teamId', upload.any(), (req, res) => {
  if (!req.params.teamId) {
    return;
  }
  res.json(req.files.map(file => {
    var ext = path.extname(file.originalname);
    return {
      originalName: req.params.teamId, filename: file.filename
    }
  }));
});

// Log
var logDirectory = path.join('./logs')
// ensure log directory exists
fs.existsSync(logDirectory) ||
    fs.mkdirSync(logDirectory)
    // create a rotating write stream
    var accessLogStream = rfs(moment().format('YYYY-MM-DD') + '.log', {
  interval: '1d',  // rotate daily
  path: logDirectory
})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}))

// Load the initial queued games
gameQueue.updateTodaysQueue();

// Manage injury and training
playerManager.init();

// Manage default market players
marketManager.init();

// Serve images out of /public
app.use(loopback.static(__dirname + '/public'));

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module) app.start();
});
