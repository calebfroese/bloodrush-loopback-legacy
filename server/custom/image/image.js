var fs = require('fs');
var images = require('images');
var PNG = require('pngjs').PNG;
var jimp = require('jimp');

module.exports = {
    createPlayers: (style, teamId, callback) => {
        if (fs.existsSync(`temp/player/${teamId}`))
            fs.mkdirSync(`temp/player/${teamId}`);
        if (fs.existsSync(`temp/player/${teamId}/frame1`))
            fs.mkdirSync(`temp/player/${teamId}/frame1`);
        if (fs.existsSync(`temp/player/${teamId}/frame1/preset`))
            fs.mkdirSync(`temp/player/${teamId}/frame1/preset`);
        if (fs.existsSync(`temp/player/${teamId}/frame4`))
            fs.mkdirSync(`temp/player/${teamId}/frame4`);
        if (fs.existsSync(`temp/player/${teamId}/frame4/preset`))
            fs.mkdirSync(`temp/player/${teamId}/frame4/preset`);
        if (fs.existsSync(`temp/player/${teamId}/frame7`))
            fs.mkdirSync(`temp/player/${teamId}/frame7`);
        if (fs.existsSync(`temp/player/${teamId}/frame7/preset`))
            fs.mkdirSync(`temp/player/${teamId}/frame7/preset`);
        // Frame 1
        var useTheseStyles = [];
        style.forEach(s => {
            // For each part
            if (s.selected || s.base) {
                useTheseStyles.push(s);
                createImg(s, s.color, `public/player/gen/frame1/${s.name}.png`, `temp/player/${teamId}/frame1/${s.name}.png`);
            }
        });
        setTimeout(() => {
            createFrame(useTheseStyles, teamId, 1);
        }, 1000);

        // Frame 4
        var useTheseStyles = [];
        style.forEach(s => {
            // For each part
            if (s.selected || s.base) {
                useTheseStyles.push(s);
                createImg(s, s.color, `public/player/gen/frame4/${s.name}.png`, `temp/player/${teamId}/frame4/${s.name}.png`);
            }
        });
        setTimeout(() => {
            createFrame(useTheseStyles, teamId, 4);
        }, 1000);

        // Frame 7
        var useTheseStyles = [];
        style.forEach(s => {
            // For each part
            if (s.selected || s.base) {
                useTheseStyles.push(s);
                createImg(s, s.color, `public/player/gen/frame7/${s.name}.png`, `temp/player/${teamId}/frame7/${s.name}.png`);
            }
        });
        setTimeout(() => {
            createFrame(useTheseStyles, teamId, 7);
            callback();
        }, 1000);
    },
    createPart: (style, teamId) => {
        createImg(style, style.color, `public/player/gen/frame1/${style.name}.png`, `public/temp/player/${teamId}/frame1/${style.name}-${style.color.r}.${style.color.g}.${style.color.b}.png`);
    }
}

function createFrame(useTheseStyles, teamId, framenum) {
    setTimeout(() => {
        joinImg(useTheseStyles, teamId, framenum);
    }, 300);
}

var deleteFolderRecursive = function (path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
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
            .pipe(new PNG({ filterType: 4 }))
            .on('parsed', function () {
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

function joinImg(styles, teamId, framenumber) {
    var base = images(`temp/player/${teamId}/frame${framenumber}/soles1.png`);
    styles.forEach(s => {
        base.draw(images(`temp/player/${teamId}/frame${framenumber}/${s.name}.png`), 0, 0)
    })
    base.save(`public/player/output/${teamId}-${framenumber}.png`, {
        quality: 100
    });
    setTimeout(() => {
        // Finished saving by now
        jimp.read(`public/player/output/${teamId}-${framenumber}.png`, function (err, image) {
            if (err) {
                console.error(err);
                return;
            }
            image
                .flip(true, false)
                .write(`public/player/output/${teamId}-${framenumber}r.png`);
        });
        // Delete temporary folders
        deleteFolderRecursive(`temp/player/${teamId}`);
        if (fs.existsSync(`temp/player/${teamId}`)) {
            fs.rmdirSync(`temp/player/${teamId}`);
        }
    }, 200);
}