'use strict';

module.exports = function (Image) {
    /**
     * Creates a part
     */
    Image.createPart = function (data, cb) {
        var customImage = require('./../custom/image/image.js');
        customImage.createPart(data.style, data.teamId);
        cb(null, null);
    };
    Image.remoteMethod(
        'createPart', {
            http: {
                path: '/createPart',
                verb: 'post'
            },
            accepts: [
                {
                    arg: 'data',
                    type: 'object',
                    http: { source: 'body' },
                    required: true
                }
            ],
            returns: {
                arg: 'token',
                type: 'string'
            }
        }
    );
};
