/**
 * Copyright (c) 2017, zoweb
 *
 * See the license in the LICENSE file (downloaded with this repository, in the root folder)
 * By using this code, you agree to the license in the file specified (the MIT license)
 */

const JSClass = require("../"), fs = require("fs");

let output = JSClass.transpile(fs.readFileSync("./example.js").toString());

console.log(output);