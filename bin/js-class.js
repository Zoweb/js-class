module.exports = () => {
    const cli = require("cli");
    const uglify = require("uglify-es");

    const readFile = require("../lib/read-file");
    const generator = require("../lib/generator");

    const classTranspiler = require("../");
    const jsClassPackage = require("../package.json");

    const options = cli.parse({
        source: ["s", "Source class file path", "file", false],
        output: ["o", "Output file path", "file", false],
        version: ["v", "Get current version"]
    });

    if (options.version) {
        console.log(`${jsClassPackage.name} v${jsClassPackage.version} by ${jsClassPackage.author}`);
        return;
    }

    if (options.source === false) cli.fatal("Invalid or no source file.");
    if (options.output === false) cli.fatal("Invalid or no output file.");

    cli.info("Transpiling JS class");

    generator(function*(cont) {
        cli.debug("Reading source file...");
        const source = yield readFile(options.source, cli.progress).then(cont());

        let result = classTranspiler.transpile(source);

        cli.debug("Uglifying code...");

        const ugly = uglify.minify(result);
        if (ugly.error) throw ugly.error;

        cli.debug("Saving code...");
        readFile.saveFile(options.output, ugly.code);

        cli.info("Completed. View the transpiled class at " + options.output);
    })().catch(function(err) {cli.fatal(err.stack)});
};