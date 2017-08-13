// Define the namespace
namespace My.Namespace {
    // Import other classes
    import Another.Namespace.Class;
    import Or.Library;

    // Define class
    class MyClass {
        // ... like JS classes

        static _EXTENSION() {
            // convert addFoo to an extension, so you can do ({}).addFoo();
            MyClass.addFoo.markAsExtensionFor(Object);
        }

        static addFoo() {
            this.foo = 5;

            return this;
        }

        constructor() {
            this.foo = "bar";
        }

        get myValue() {
            return this.foo;
        }
        set myValue(val) {
            this.foo = val;
        }
    }
}