# JS Class

This tool allows you to transpile namespace'd JavaScript files into native JS.

## Installing
After making sure [NodeJS](https://nodejs.org "NodeJS") is installed, run `$ npm install -g js-class-namespace`.

## Building Classes
### With the CLI
Run `$ js-class --source MyClass.class.js --output MyClass.js`

### In-code

```js
const JSClass = require("js-class-namespace");
const fs = require("fs");

// load MyClass.class.js
let myClassFile = fs.readFileSync("MyClass.class.js");
let transpiled = JSClass.transpile(myClassFile);

// save to MyClass.js
fs.writeFileSync("MyClass.js", transpiled);
```

## Using Classes
Once built, classes are imported into a website using `include.js`:

```html
<script src="https://cdn.rawgit.com/Zoweb/js-class/ba16dfe3/browser/include.js"></script>
<script>
include("My.Library.Extensions");

includes.onload = () => {
    console.log([1,2,3,4,5].randomElement());
};
</script>
```

## Writing Classes
The class format is similar to C# and Java:

```js
// Define the namespace
namespace My.Namespace {
    // Import other classes
    import Another.Namespace.Class;
    import Or.Library;

    // Define class
    class MyClass {
        // ... like JS classes
        constructor() {
            return "foo";
        }
    }
}
```

Classes can also become extensions for other classes:

```js
namespace My.Library {
    class Extensions {
        static _EXTENSION() {
            // Here we can mark static members as extensions:
            Extensions.randomElement.markAsExtension(Array);
            // would mean that we can do [].randomElement();
        }

        static randomElement() {
            // this is defined, as we are in an extension
            return this[Math.floor(Math.random() * this.length)];
        }
    }
}
```

## Importing Classes - *Important Information*
Class namespaces **MUST** be their file structure from the file that is including the class, preceded by a src/.

For example, this would NOT WORK: A class with namespace `My.Namespace` in the directory `./lib/A/Namespace/`.
It MUST be in the directory `./src/My/Namespace/`. The file including it MUST be in the directory `./`.

See the below example folder structure, which is correct:

```
|- index.html
|- js/
 \- import.js
 |- code.js
 |- src/
  \- My/
   \- Library/
   |\- Extensions.js
   |- Namespace/
    \- MyClass.js
```

## License
JS-Class is licensed under the MIT License. See `LICENSE` for more info.