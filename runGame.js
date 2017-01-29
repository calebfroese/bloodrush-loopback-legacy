// process.argv.forEach(function (val, index, array) {
//   console.log(index + ': ' + val);
// });
// console.log('test:season', process.argv[2])
console.log('test:game', process.argv[2])
var simulate = require('./server/custom/game/simulate.js');
var game = simulate.simulate(process.argv[2]);
