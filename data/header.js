(function(namespace, imports, namespacedClass) {
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

            method.markAsExtensionFor = type => {
                type.prototype[methodName] = function(...args) {
                    return method(this, ...args);
                };
            };

            /**
             * @deprecated
             * @type {(function(*))|*}
             */
            method.markAsExtension = method.markAsExtensionFor;
        });

        namespacedClass._EXTENSION();

        Object.getOwnPropertyNames(namespacedClass).forEach(methodName => {
            if (!namespacedClass.hasOwnProperty(methodName)) return;

            let method = namespacedClass[methodName];

            delete method.markAsExtension;
            delete method.markAsExtensionFor;
        });
    }

    namespaceObject[namespacedClass.name] = namespacedClass;
})(