var request = require('request');
const apiURL = 'http://0.0.0.0:3000/api';
module.exports = (method, path, params, callback) => {
    console.log(method, 'query on', `${apiURL}${path}`)
    console.log(params);

    var req = {
        method: method,
        uri: `${apiURL}${path}`,
        json: true,
        body: params
    }
    request(req, (error, response, body) => {
        //Check for error
        if (error) {
            return console.log('Error:', error);
        }

        //Check for right status code
        if (response.statusCode !== 200) {
            return console.log('Invalid Status Code Returned:', response.statusCode);
        }

        callback(body);
    });
}