var request = require('request');
const apiURL = 'http://0.0.0.0:3000/api';
var logging = require('./../logging.js');
module.exports = (method, path, params, callback) => {
    var req = {
        method: method,
        uri: `${apiURL}${path}`,
        json: true,
        body: params
    }
    request(req, (error, response, body) => {
        // Check for error
        if (error) {
            logging.error(error);
            return;
        }
        // Check for right status code
        if (response.statusCode !== 200) {
            logging.error('Invalid Status Code Returned: ' + response.statusCode);
            return;
        }
        callback(body);
    });
}