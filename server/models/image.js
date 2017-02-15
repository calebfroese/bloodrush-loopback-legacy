'use strict';

module.exports = function(Image) {
  /**
   * Creates a part
   */
  Image.createPreview = function(data, cb) {
    var customImage = require('./../custom/image/image.js');
    customImage.createPreview(data.styles, data.teamId, res => {
      cb(res);
    });
  };
  Image.remoteMethod('createPreview', {
    http: {path: '/createPreview', verb: 'post'},
    accepts:
        [{arg: 'data', type: 'object', http: {source: 'body'}, required: true}],
    returns: {arg: 'response', type: 'object'}
  });

  /**
   * Creates player output by combining the images and flattening
   */
  Image.createPlayers = function(data, cb) {
    var customImage = require('./../custom/image/image.js');
    customImage.createPlayers(data.style, data.teamId, res => {
      cb(null, res);
    });
  };
  Image.remoteMethod('createPlayers', {
    http: {path: '/createPlayers', verb: 'post'},
    accepts:
        [{arg: 'data', type: 'object', http: {source: 'body'}, required: true}],
    returns: {arg: 'response', type: 'object'}
  });
};
