var fs = require('fs');
var images = require('images');
var PNG = require('pngjs').PNG;
var jimp = require('jimp');
var logging = require('./../../logging.js');

const WAIT_BEFORE_JOIN_IMG = 3000;

module.exports =
    {
      createPlayers: (style, teamId, callback) => {
        createPlayerFolders(teamId);

        Promise
            .all([
              createFrame(style, teamId, 'frame1'),
              createFrame(style, teamId, 'frame4'),
              createFrame(style, teamId, 'frame7'),
              createFrame(style, teamId, 'attack1'),
              createFrame(style, teamId, 'attack2'),
              createFrame(style, teamId, 'attack3'),
              createFrame(style, teamId, 'knockout1'),
              createFrame(style, teamId, 'knockout2'),
              createFrame(style, teamId, 'out1')
            ])
            .then(() => {
              logging.info('Created player images for team ' + teamId);
              callback({ok: true});
            })
            .catch(err => {
              logging.error(err);
              callback(err);
            })
      },
      createPart: (style, teamId, callback) => {
        createPlayerFolders(teamId);
        createImg(
            style, style.color, `public/player/gen/frame1/${style.name}.png`,
            `public/temp/player/${teamId}/frame1/${style.name
            }-${style.color.r}.${style.color.g}.${style.color.b}.png`,
            cb => {
              callback(cb);
            })
      }
    }

function createPlayerFolders(teamId) {
  // Make sure permafolders are there
  if (!fs.existsSync(`temp`)) fs.mkdirSync(`temp`);
  if (!fs.existsSync(`temp/player`)) fs.mkdirSync(`temp/player`);
  if (!fs.existsSync(`public/temp`)) fs.mkdirSync(`public/temp`);
  if (!fs.existsSync(`public/temp/player`)) fs.mkdirSync(`public/temp/player`);
  if (!fs.existsSync(`public/player`)) fs.mkdirSync(`public/player`);
  if (!fs.existsSync(`public/player/output`))
    fs.mkdirSync(`public/player/output`);

  deleteFolderRecursive(`temp/player/${teamId}`);
  deleteFolderRecursive(`public/temp/player/${teamId}`);
  fs.mkdirSync(`temp/player/${teamId}`);
  fs.mkdirSync(`temp/player/${teamId}/frame1`);
  fs.mkdirSync(`temp/player/${teamId}/frame1/preset`);
  fs.mkdirSync(`temp/player/${teamId}/frame4`);
  fs.mkdirSync(`temp/player/${teamId}/frame4/preset`);
  fs.mkdirSync(`temp/player/${teamId}/frame7`);
  fs.mkdirSync(`temp/player/${teamId}/frame7/preset`);
  fs.mkdirSync(`temp/player/${teamId}/attack1`);
  fs.mkdirSync(`temp/player/${teamId}/attack1/preset`);
  fs.mkdirSync(`temp/player/${teamId}/attack2`);
  fs.mkdirSync(`temp/player/${teamId}/attack2/preset`);
  fs.mkdirSync(`temp/player/${teamId}/attack3`);
  fs.mkdirSync(`temp/player/${teamId}/attack3/preset`);
  fs.mkdirSync(`temp/player/${teamId}/knockout1`);
  fs.mkdirSync(`temp/player/${teamId}/knockout1/preset`);
  fs.mkdirSync(`temp/player/${teamId}/knockout2`);
  fs.mkdirSync(`temp/player/${teamId}/knockout2/preset`);
  fs.mkdirSync(`temp/player/${teamId}/out1`);
  fs.mkdirSync(`temp/player/${teamId}/out1/preset`);
  fs.mkdirSync(`public/temp/player/${teamId}`);
  fs.mkdirSync(`public/temp/player/${teamId}/frame1`);
  fs.mkdirSync(`public/temp/player/${teamId}/frame1/preset`);
  fs.mkdirSync(`public/temp/player/${teamId}/frame4`);
  fs.mkdirSync(`public/temp/player/${teamId}/frame4/preset`);
  fs.mkdirSync(`public/temp/player/${teamId}/frame7`);
  fs.mkdirSync(`public/temp/player/${teamId}/frame7/preset`);
  fs.mkdirSync(`public/temp/player/${teamId}/attack1`);
  fs.mkdirSync(`public/temp/player/${teamId}/attack1/preset`);
  fs.mkdirSync(`public/temp/player/${teamId}/attack2`);
  fs.mkdirSync(`public/temp/player/${teamId}/attack2/preset`);
  fs.mkdirSync(`public/temp/player/${teamId}/attack3`);
  fs.mkdirSync(`public/temp/player/${teamId}/attack3/preset`);
  fs.mkdirSync(`public/temp/player/${teamId}/knockout1`);
  fs.mkdirSync(`public/temp/player/${teamId}/knockout1/preset`);
  fs.mkdirSync(`public/temp/player/${teamId}/knockout2`);
  fs.mkdirSync(`public/temp/player/${teamId}/knockout2/preset`);
  fs.mkdirSync(`public/temp/player/${teamId}/out1`);
  fs.mkdirSync(`public/temp/player/${teamId}/out1/preset`);
}

function createFrame(styles, teamId, frameName) {
  var useTheseStyles = [];
  var promises = [];
  styles.forEach(s => {
    // For each part
    if (s.selected || s.base) {
      useTheseStyles.push(s);
      var prom = new Promise((resolve, reject) => {
        console.log('created');
        createImg(
            s, s.color, `public/player/gen/${frameName}/${s.name}.png`,
            `temp/player/${teamId}/${frameName}/${s.name}.png`, cb => {
              console.log('resolved');
              resolve();
            });
      });
      promises.push(prom);
    }
  });
  return Promise.all(promises).then(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        joinImg(useTheseStyles, teamId, frameName, x => {
          if (x === null || x === undefined) {
            // Delete temporary folders
            resolve();
          } else {
            reject(x);
          }
        });
      }, 500);
    });
  })
}

var deleteFolderRecursive = function(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index) {
      var curPath = path + '/' + file;
      if (fs.lstatSync(curPath).isDirectory()) {  // recurse
        deleteFolderRecursive(curPath);
      } else {  // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

function createImg(style, rgba, fromUrl, toUrl, callback) {
  if (style.hidden) {
    // Just copy the file over without recolor
    fs.createReadStream(fromUrl).pipe(fs.createWriteStream(toUrl));
    callback();
  } else {
    fs.createReadStream(fromUrl)
        .pipe(new PNG({filterType: 4}))
        .on('parsed', function() {
          for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
              var idx = (this.width * y + x) << 2;
              this.data[idx] = rgba.r;
              this.data[idx + 1] = rgba.g;
              this.data[idx + 2] = rgba.b;
              // this.data[idx + 3] = this.data[idx + 3] >> 1; // opacity
            }
          }
          var pipe = this.pack().pipe(fs.createWriteStream(toUrl));
          setTimeout(() => {
            callback();
          }, 1000);
        });
  }
}

function joinImg(styles, teamId, frameName, cb) {
  var base;
  if (fs.existsSync(`temp/player/${teamId}/${frameName}/soles1.png`)) {
    base = images(`public/player/gen/${frameName}/soles1.png`);
  } else {
    cb(null);
    return;
  }
  styles.forEach(
      s => {base.draw(
          images(`temp/player/${teamId}/${frameName}/${s.name}.png`), 0, 0)});
  base.save(`public/player/output/${teamId}-${frameName}.png`, {quality: 100});
  // Finished saving by now
  jimp.read(
      `public/player/output/${teamId}-${frameName}.png`, function(err, image) {
        if (err) {
          logging.error(err);
          cb(err);
          return;
        }
        image.flip(true, false)
            .write(`public/player/output/${teamId}-${frameName}r.png`);
      });
  // Remove the directory
  deleteFolderRecursive(`temp/player/${teamId}/${frameName}`)
  cb();
}