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

        // Frame 1
        var useTheseStyles = [];
        style.forEach(s => {
          // For each part
          if (s.selected || s.base) {
            useTheseStyles.push(s);
            createImg(
                s, s.color, `public/player/gen/frame1/${s.name}.png`,
                `temp/player/${teamId}/frame1/${s.name}.png`);
          }
        });
        setTimeout(() => {
          createFrame(useTheseStyles, teamId, 1);
        }, WAIT_BEFORE_JOIN_IMG);

        // Frame 4
        var useTheseStyles = [];
        style.forEach(s => {
          // For each part
          if (s.selected || s.base) {
            useTheseStyles.push(s);
            createImg(
                s, s.color, `public/player/gen/frame4/${s.name}.png`,
                `temp/player/${teamId}/frame4/${s.name}.png`);
          }
        });
        setTimeout(() => {
          createFrame(useTheseStyles, teamId, 4);
        }, WAIT_BEFORE_JOIN_IMG);

        // Frame 7
        var useTheseStyles = [];
        style.forEach(s => {
          // For each part
          if (s.selected || s.base) {
            useTheseStyles.push(s);
            createImg(
                s, s.color, `public/player/gen/frame7/${s.name}.png`,
                `temp/player/${teamId}/frame7/${s.name}.png`);
          }
        });
        setTimeout(() => {
          createFrame(useTheseStyles, teamId, 7, () => {
            callback({ok: true});
          });
          logging.info('Created player images for ' + teamId);
        }, WAIT_BEFORE_JOIN_IMG);
      },
      createPart: (style, teamId) => {
        if (fs.existsSync(`public/temp/player/${teamId}/frame1/preset`)) {
          // Does the public directorry for the user exist? If not create
          createImg(
              style, style.color, `public/player/gen/frame1/${style.name}.png`,
              `public/temp/player/${teamId}/frame1/${style.name
              }-${style.color.r}.${style.color.g}.${style.color.b}.png`);
        } else {
          createPlayerFolders(teamId);
          createImg(
              style, style.color, `public/player/gen/frame1/${style.name}.png`,
              `public/temp/player/${teamId}/frame1/${style.name
              }-${style.color.r}.${style.color.g}.${style.color.b}.png`);
        }
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
  fs.mkdirSync(`public/temp/player/${teamId}`);
  fs.mkdirSync(`public/temp/player/${teamId}/frame1`);
  fs.mkdirSync(`public/temp/player/${teamId}/frame1/preset`);
  fs.mkdirSync(`public/temp/player/${teamId}/frame4`);
  fs.mkdirSync(`public/temp/player/${teamId}/frame4/preset`);
  fs.mkdirSync(`public/temp/player/${teamId}/frame7`);
  fs.mkdirSync(`public/temp/player/${teamId}/frame7/preset`);
}

function createFrame(useTheseStyles, teamId, framenum, callback) {
  setTimeout(() => {
    joinImg(useTheseStyles, teamId, framenum, callback);
  }, 300);
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

function createImg(style, rgba, fromUrl, toUrl) {
  if (style.hidden) {
    // Just copy the file over without recolor
    fs.createReadStream(fromUrl).pipe(fs.createWriteStream(toUrl));
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
        });
  }
}

function joinImg(styles, teamId, framenumber, callback) {
  var base = images(`temp/player/${teamId}/frame${framenumber}/soles1.png`);
  styles.forEach(
      s => {base.draw(
          images(`temp/player/${teamId}/frame${framenumber}/${s.name}.png`), 0,
          0)})
  base.save(
      `public/player/output/${teamId}-${framenumber}.png`, {quality: 100});
  setTimeout(() => {
    // Finished saving by now
    jimp.read(
        `public/player/output/${teamId}-${framenumber}.png`,
        function(err, image) {
          if (err) {
            console.error(err);
            return;
          }
          image.flip(true, false)
              .write(`public/player/output/${teamId}-${framenumber}r.png`);
        });
    // Delete temporary folders
    deleteFolderRecursive(`temp/player/${teamId}`);
    if (fs.existsSync(`temp/player/${teamId}`)) {
      fs.rmdirSync(`temp/player/${teamId}`);
      callback({ok: true});
    }
  }, 200);
}