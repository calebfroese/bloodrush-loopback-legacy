var logging = require('./server/logging.js');

logging.event(`About to simulate game ${process.argv[2]}`);
var simulate = require('./server/custom/game/simulate.js');
var game = simulate.simulate(process.argv[2]);
