var http = require('http');
module.exports = {
    get: (path, cb) => {
        http.get({
            hostname: '0.0.0.0',
            port: 3000,
            path: `/api${path}`
        }, (res) => {
            var body = [];
            res.on('data', function (chunk) {
                body.push(chunk);
            }).on('end', function () {
                body = Buffer.concat(body).toString();
                console.log(body);
                cb(JSON.parse(body));
            });
        });
    },
    patch: (path, cb) => {
        http.patch({
            hostname: '0.0.0.0',
            port: 3000,
            path: `/api${path}`
        }, (res) => {
            var body = [];
            res.on('data', function (chunk) {
                body.push(chunk);
            }).on('end', function () {
                body = Buffer.concat(body).toString();
                console.log(body);
                cb(JSON.parse(body));
            });
        });
    }
}