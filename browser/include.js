/**
 * Copyright (c) 2017, zoweb
 *
 * See the license in the LICENSE file (downloaded with this repository, in the root folder)
 * By using this code, you agree to the license in the file specified (the MIT license)
 */

(function() {
    "use strict";
    let global;
    if (window) global = window;
    else if (module && module.exports) global = module.exports;

    let loadingQueue = 0;
    let included = [];

    let globalLoadStartTime = global.performance && global.performance.now ? global.performance.now() : global.Date.now();

    function checkQueue() {
        "use strict";
        if (loadingQueue <= 0) {
            let globalLoadEndTime = global.performance && global.performance.now ? global.performance.now() : global.Date.now();
            let globalLoadTime = globalLoadEndTime - globalLoadStartTime;

            console.info("Finished including after " + globalLoadTime.toFixed(3) + "ms");

            global.includes.onload();
        }
    }

    global.include = (function() {
        "use strict";
        function include(src) {
            "use strict";
            if (included.indexOf(src) >= 0) return;

            loadingQueue++;
            included.push(src);

            let script = document.createElement("script");
            let source = "src/" + src.split(".").join("/") + ".js";

            let error = new Error().stack.split("@");
            if (error.length >= 3) console.debug(`${error[2].replace(/\n/, "").split(":")[1].substr(2)} triggered including of ${src} from "${source}"`);
            else console.log(`Including ${src} from ${source} %cuse Firefox for more detail`, "font-weight: bold; color: red; background: #fff0f0; padding: 2px; border: 1px solid #ffd7d7");

            script.onload = () => {
                "use strict";
                script.remove();
                loadingQueue--;

                checkQueue();
            };
            document.body.appendChild(script);
            script.src = source;
        }

        return include;
    })();

    global.includes = {
        onload: () => {}
    }
}());