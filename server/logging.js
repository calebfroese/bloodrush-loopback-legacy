var colour = require('colour');
var moment = require('moment');

colour.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: ['yellow', 'underline'],  // Applies two styles at once
  debug: 'blue',
  error: 'red bold'  // Again, two styles
});

module.exports = {
  info: (str) => {
    console.log(`[${timeStamp()}  INFO ]:`.white.bold, str.white);
  },
  error: (str) => {
    console.log(`[${timeStamp()} ERROR ]:`.red.bold, str.red);
  },
  warn: (str) => {
    console.log(`[${timeStamp()}  WARN ]:`.yellow.bold, str.yellow);
  },
  event: (str) => {
    console.log(`[${timeStamp()} EVENT ]:`.cyan.bold, str.cyan);
  }
}

function timeStamp(full) {
  if (full) return moment().format('MMM Do YY HH:mm:ss');
  return moment().format('HH:mm:ss');
}
