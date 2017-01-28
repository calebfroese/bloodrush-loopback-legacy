var request = require('request');
const apiURL = 'http://0.0.0.0:3000/api';
module.exports = (method, path, callback) => {
    console.log('Querying ', `${apiURL}${path}`)
    request[method](`${apiURL}${path}`, (error, response, body) => {
        //Check for error
        if (error) {
            return console.log('Error:', error);
        }

        //Check for right status code
        if (response.statusCode !== 200) {
            return console.log('Invalid Status Code Returned:', response.statusCode);
        }

        callback(JSON.parse(body));
    });
}