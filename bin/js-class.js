//#!/usr/bin/env node

var cli = require("cli");
var uglify = require("uglify-es");

var readFile = require("../lib/read-file");
var generator = require("../lib/generator");

var classTranspiler = require("../");

var options = cli.parse({
    source: ["s", "Source class file path", "file", false],
    output: ["o", "Output file path", "file", false]
});

if (options.source === false) cli.fatal("Invalid or no source file.");
if (options.output === false) cli.fatal("Invalid or no output file.");

cli.info("Transpiling JS class");

generator(function*(cont) {
    cli.debug("Reading source file...");
    var source = yield readFile(options.source, cli.progress).then(cont());

    var result = classTranspiler.transpile(source);

    cli.debug("Uglifying code...");

    var ugly = uglify.minify(result);
    if (ugly.error) throw ugly.error;

    cli.debug("Saving code...");
    readFile.saveFile(options.output, ugly.code);

    cli.info("Compvared. View the transpiled class at " + options.output);
})().catch(function(err) {cli.fatal(err.stack)});