/**
 * Copyright (c) 2017, zoweb
 *
 * See the license in the LICENSE file (downloaded with this repository, in the root folder)
 * By using this code, you agree to the license in the file specified (the MIT license)
 */

const generator = require("./generator");
const fs = require("fs");

module.exports = generator(function*(fileName, onProgress, cont) {
    let recievedBytes = 0, totalBytes = 0;
    let fileReadStream = fs.createReadStream(fileName);
    let fileContents = "";

    let stats = yield fs.stat(fileName, cont(1));
    totalBytes = stats.size;

    let readStream = fs.createReadStream(fileName);

    readStream.on("data", chunk => {
        recievedBytes = chunk.length;

        fileContents += chunk;

        onProgress(recievedBytes / totalBytes);
    });

    yield readStream.on("end", cont(0));

    return fileContents;
});

module.exports.saveFile = (...args) => fs.writeFileSync(...args);