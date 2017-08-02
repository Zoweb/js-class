/**
 * Copyright (c) 2017, zoweb
 *
 * See the license in the LICENSE file (downloaded with this repository, in the root folder)
 * By using this code, you agree to the license in the file specified (the MIT license)
 */

const esprima = require("esprima");

const readFile = require("./lib/read-file");
const generator = require("./lib/generator");

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

let transpile = function(source) {
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

    let header = `(function(namespace, imports, namespacedClass) {
    if (typeof namespace !== "string") throw new TypeError("Namespace must be string");
    if (typeof namespacedClass !== "function" && typeof namespacedClass.name !== "string") throw new TypeError("Namespaced Class must be a class");

    let global;
    if (window) global = window;
    else if (module && module.exports) global = module.exports;

    if (!global.include) {
        throw new ReferenceError("Classes must be included using include.js");
    }

    imports.forEach(src => global.include(src));

    let namespaceObject = namespace.split(".").reduce((a, b) => {
        if (typeof a[b] !== "object") a[b] = {};
        return a[b];
    }, global);

    if (typeof namespacedClass._EXTENSION === "function") {
        Object.getOwnPropertyNames(namespacedClass).forEach(methodName => {
            if (!namespacedClass.hasOwnProperty(methodName)) return;

            let method = namespacedClass[methodName];

            method.markAsExtension = type => {
                type.prototype[methodName] = function(...args) {
                    return method(this, ...args);
                };
            };
        });

        namespacedClass._EXTENSION();

        Object.getOwnPropertyNames(namespacedClass).forEach(methodName => {
            if (!namespacedClass.hasOwnProperty(methodName)) return;

            let method = namespacedClass[methodName];

            delete method.markAsExtension;
        });
    }

    namespaceObject[namespacedClass.name] = namespacedClass;
})(`;
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

    let everything = headerTokens.concat(sourceTokens);

    let output = [];
    everything.forEach((el, i) => {
        let currentOut = el.value;

        if (el.type === "Keyword") currentOut += " ";

        output.push(currentOut);
    });

    return output.join("");
};

module.exports.transpile = transpile;