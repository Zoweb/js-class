#!/usr/bin/env node

/**
 * Copyright (c) 2017, zoweb
 *
 * See the license in the LICENSE file (downloaded with this repository, in the root folder)
 * By using this code, you agree to the license in the file specified (the MIT license)
 */

const esprima = require("esprima");
const cli = require("cli");
const uglify = require("uglify-es");

const readFile = require("./lib/read-file");
const generator = require("./lib/generator");

const options = cli.parse({
    source: ["s", "Source class file path", "file", false],
    output: ["o", "Output file path", "file", false]
});

if (options.source === false) cli.fatal("Invalid or no source file.");
if (options.output === false) cli.fatal("Invalid or no output file.");

cli.info("Attempting to parse " + options.source);

function throwUnexpectedError(token) {
    throw new TypeError(`Unexpected ${token.type.toLowerCase()} '${token.value}' at ${token.loc.start.line}:${token.loc.start.column}`);
}

function parseObject(tokens, until) {
    let objectValue = "", currentToken = tokens.shift();

    let previousTokenType = "dot";

    while (true) {
        if (previousTokenType === "dot" && currentToken.type !== "Identifier") {
            throwUnexpectedError(currentToken);
        }
        if (previousTokenType === "name" && !(currentToken.type === "Punctuator" && currentToken.value === ".")) {
            throwUnexpectedError(currentToken);
        }

        if (previousTokenType === "dot") previousTokenType = "name";
        else previousTokenType = "dot";

        objectValue += currentToken.value;

        let nextToken = tokens.slice(0, 1)[0];
        if (nextToken.type === until.type && nextToken.value === until.value) {
            break;
        }

        currentToken = tokens.shift();
    }

    return objectValue;
}

if (!String.prototype.padEnd) {
    String.prototype.padEnd = function padEnd(targetLength,padString) {
        targetLength = targetLength>>0; //floor if number or convert non-number to 0;
        padString = String(padString || ' ');
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return String(this) + padString.slice(0,targetLength);
        }
    };
}

generator(function*(cont) {
    cli.debug("Loading file...");
    let source = yield readFile(options.source, cli.progress).then(cont());
    let sourceTokens = esprima.tokenize(source, {
        loc: true
    });

    let lastSquig = sourceTokens.pop();
    if (lastSquig.type !== "Punctuator" || lastSquig.value !== "}") throwUnexpectedError(lastSquig);

    sourceTokens.push({
        type: "Punctuator",
        value: ")"
    });
    sourceTokens.push({
        type: "Punctuator",
        value: ";"
    });

    let workingToken = sourceTokens.shift();
    if (workingToken.type !== "Identifier" || workingToken.value !== "namespace") throw new SyntaxError("Class must have namespace");

    let namespace = parseObject(sourceTokens, {
        type: "Punctuator",
        value: "{"
    });

    cli.debug("Set namespace to `" + namespace + "`.");

    // remove "{"
    sourceTokens.shift();

    // loop through imports
    let imports = [];
    workingToken = sourceTokens.shift();
    while (true) {
        if (workingToken.type === "Keyword" && workingToken.value === "class") {
            // skip class
            break;
        }

        if (!(workingToken.type === "Keyword" && workingToken.value === "import")) {
            throwUnexpectedError(workingToken);
        }

        // add to list
        imports.push(parseObject(sourceTokens, {
            type: "Punctuator",
            value: ";"
        }));

        // Remove ;
        sourceTokens.shift();

        workingToken = sourceTokens.shift();
    }

    cli.debug("Imports are: `" + imports.join("`, `") + "`");

    cli.debug("Loading header...");
    let header = yield readFile("./data/header.js", cli.progress).then(cont());
    let headerTokens = esprima.tokenize(header);

    // push an argument containing the namespace to the tokens
    headerTokens.push({
        type: "String",
        value: `"${namespace}"`
    }, {
        type: "Punctuator",
        value: ","
    }, {
        type: "Punctuator",
        value: "["
    });

    imports.forEach(curr => {
        headerTokens.push({
            type: "String",
            value: `"${curr}"`
        }, {
            type: "Punctuator",
            value: ","
        });
    });

    headerTokens.pop();
    headerTokens.push({
        type: "Punctuator",
        value: "]"
    }, {
        type: "Punctuator",
        value: ","
    }, {
        type: "Keyword",
        value: "class"
    });

    cli.debug("Adding header...");
    let everything = headerTokens.concat(sourceTokens);

    let output = [];
    everything.forEach((el, i) => {
        let currentOut = el.value;

        if (el.type === "Keyword") currentOut += " ";

        output.push(currentOut);
    });

    let outputStr = output.join("");

    cli.debug("Uglifying code...");
    let ugly = uglify.minify(outputStr);

    if (ugly.error) throw ugly.error;

    cli.debug("Saving code...");
    readFile.saveFile(options.output, ugly.code);
})().catch(err => cli.fatal(err.stack));



/*readFile(options.source, (...args) => cli.progress(...args)).then(fileContents => {
    cli.debug("File:\n" + fileContents);

    cli.debug("Loading header...");

    cli.debug("Editing tokens...");
    let tokens = esprima.tokenize(fileContents, {
        comments: true
    });

    cli.debug("Re-making file...");

    console.log(JSON.stringify(tokens, null, 4));
}).catch(err => {
    cli.fatal(err.stack);
});*/