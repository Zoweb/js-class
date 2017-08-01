# js-class
Build tool to allow classes to use namespaces and imports

Usage:
js-class --source mySourceClass.js --output myOutputFile.js

mySourceClass.js:

```
namespace My.Namespace {
  import My.Other.Class;
  
  class MyClass {
    // ...
  }
}
