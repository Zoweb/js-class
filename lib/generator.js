/**
 * Copyright (c) 2017, zoweb
 *
 * See the license in the LICENSE file (downloaded with this repository, in the root folder)
 * By using this code, you agree to the license in the file specified (the MIT license)
 */

/*function create(generator) {
    if (generator.constructor.name !== "GeneratorFunction") throw new TypeError("Function is not a generator");

    let resolvePromise, promise = new Promise(yay => resolvePromise = (...args) => yay(...args));

    function loop(gen, arg) {
        try {
            let result = gen.next(arg);

            if (result.done) {
                resolvePromise(result.value);
            }
        } catch (err) {
            gen.throw(err);
        }
    }

    return (...args) => {
        let gen = generator(...args, arg => {
            loop(gen, arg);
        }, argNum => (...args) => {
            loop(gen, args[argNum]);
        });

        loop(gen);

        return promise;
    };
}*/

function create(generator) {
    if (generator.constructor.name !== "GeneratorFunction") throw new TypeError("Function is not a generator");

    return (...args) => {
        return new Promise((yay, nay) => {
            let next = (paramNum = 0) => {
                return (...results) => {
                    try {
                        let result = gen.next(results[paramNum]);

                        if (result.done === true) {
                            yay(result.value);
                        }
                    } catch (err) {
                        nay(err);
                    }
                };
            };

            let gen = generator(...args, next);

            gen.next();
        })
    };
}

module.exports = create;