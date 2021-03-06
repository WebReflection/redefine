//remove:

// to test this via node, from redefine folder
// npm install wru
// wru test/redefine.js

// -------------------------------------------------------
// sorry, this works locally and for Rhino only
// cd ~/code/redefine
// java -jar ~/code/wru/builder/jar/js.jar ~/code/redefine/test/redefine.js

// Rhino ... doesn't work anyhow unless you have wru repo too
var require = require || function (global, cache, base) {
  return function require(path) {
    if (cache[path]) return cache[path];
    var
      filename = new java.io.File(
        base + java.io.File.separator + path
      ).getCanonicalPath(),
      exports = cache[path] = {},
      module = {
        id: path,
        parent: global,
        filename: filename,
        exports: exports
      }
    ;
    Function(
      "global", "module", "exports",
      readFile(filename)
    ).call(exports,
      global, module, exports
    );
    ({}.hasOwnProperty).call(
      exports = module.exports,
      "loaded"
    ) || (exports.loaded = true);
    return cache[path] = exports;
  };
}(this, {}, new java.io.File(
  environment["sun.java.command"].split(/ +/).pop().replace(
    new RegExp(java.io.File.separator + "[^" + java.io.File.separator + "]*$"), "")
  ).getCanonicalPath()
);

// still Rhino ...
if (typeof load == "function") {
  load(
    ["..", "wru", "build", "wru.console.js"].join(
      java.io.File.separator
    )
  );
}

// Rhino and node.js
var
  redefine = require('../src/redefine.js')//.redefine
;
//:remove

var
  redefine = redefine || _.redefine,
  as = redefine.as,
  from = redefine.from,
  later = redefine.later
;

// the shared test
wru.test([{
  name: "inheritance",
  test: function () {
    var nullproto = from(null);
    wru.assert("null object", nullproto.property = true);
    wru.assert("null instance", !(nullproto instanceof Object));
    function Whatever(){}
    var o = {};
    wru.assert("generic function", from(Whatever) instanceof Whatever);
    wru.assert("generic object", o.isPrototypeOf(from(o)));
  }
},{
  name: "basic define",
  test: function () {
    var sentence = "this is a",
        a = {},
        b = redefine(a, {
          toString: function () {
            return sentence;
          }
        });
    wru.assert("returned correctly as first argument", a === b);
    wru.assert("property set correctly", String(b) === sentence);
    a = {};
    b = redefine(a, "toString", b.toString);
    wru.assert("returned again correctly as first argument", a === b);
    wru.assert("property again set correctly", String(b) === sentence);
  }
},{
  name: "nasty environment",
  setup: function () {
    Object.prototype.get = function screwed(){
      // deal with it
    };
    Object.prototype.configurable =
    Object.prototype.enumerable =
    Object.prototype.writable = true;
  },
  test: function () {
    var failed = false;
    try {
      var o = Object.defineProperty({}, "key", {value: "value"});
    } catch(o_O) {
      failed = true;
    }
    wru.assert("ES5 failed", failed);
    var o = redefine({}, "key", "value");
    wru.assert("not enumerable", !o.propertyIsEnumerable("key"));
    delete o.key;
    wru.assert("not configurable", "key" in o);
    o.key = 123;
    wru.assert("not writable", o.key === "value");
    // defaults
    o = redefine({}, "key", "value", {enumerable: true});
    wru.assert("enumerable", o.propertyIsEnumerable("key"));
    delete o.key;
    wru.assert("not configurable", "key" in o);
    o.key = 123;
    wru.assert("not writable", o.key === "value");
    o = redefine({}, "key", "value", {configurable: true, enumerable: true});
    wru.assert("enumerable", o.propertyIsEnumerable("key"));
    delete o.key;
    wru.assert("configurable", !("key" in o));
    o = redefine({}, "key", "value", {writable: true, enumerable: true});
    o.key = 123;
    wru.assert("not writable", o.key === 123);
    wru.assert("enumerable", o.propertyIsEnumerable("key"));
    delete o.key;
    wru.assert("not configurable", "key" in o);
  },
  teardown: function () {
    delete Object.prototype.get;
    delete Object.prototype.configurable;
    delete Object.prototype.enumerable;
    delete Object.prototype.writable;
  }
},{
  name: "define plus defaults",
  test: function () {
    var o = redefine({},"k",1);
    wru.assert("not enumerable", o.k && !o.propertyIsEnumerable("k"));
    delete o.k;
    wru.assert("not configurable", o.k);
    o.k = "writable?";
    wru.assert("not writable", o.k === 1);
    redefine.defaults = {enumerable: true};
    o = redefine({},"k",1);
    wru.assert("enumerable via defaults", o.k && o.propertyIsEnumerable("k"));
    delete o.k;
    wru.assert("not configurable again", o.k);
    o.k = "writable?";
    wru.assert("not writable again", o.k === 1);
    redefine.defaults = null;
    o = redefine({},"k",1);
    wru.assert("not enumerable again", o.k && !o.propertyIsEnumerable("k"));
    o = redefine({},"k",1, {enumerable:true});
    wru.assert("enumerable with explicit defaults", o.k && o.propertyIsEnumerable("k"));
  }
},{
  name: "ES5 descriptors via .as()",
  test: function (tmp) {
    var
      result = "",
      o = redefine({}, {
        key: as({
          get: function () {
            return result += "get";
          },
          set: function (value) {
            result += value;
          },
          enumerable: true
        })
      })
    ;
    o.key = "set";
    tmp = o.key;
    wru.assert("both getters and setters executed", result === "setget");
    wru.assert("enumerability respected", o.propertyIsEnumerable("key"));
  }
},{
  name: "lazy/later property assignment",
  test: function () {
    function LaterOn() {}
    var wasRightContext = 123;
    var shared = {};
    var assigned = false;
    redefine(LaterOn.prototype, {
      handlers: later(function () {
        wasRightContext = this;
        assigned = true;
        return {};
      }),
      shared: later(function () {
        return shared;
      })
    });
    var nlo;
    wru.assert("handlers in instances", "handlers" in (nlo = new LaterOn));
    wru.assert("handlers still never assigned", !assigned);
    wru.assert("handlers is set once", nlo.handlers === nlo.handlers);
    wru.assert("and assigned is true indeed", assigned);
    wru.assert("it was the right context", wasRightContext === nlo);
    wru.assert("handlers is unique per each instance", (new LaterOn).handlers !== nlo.handlers);
    wru.assert("but this is not true for shared", (new LaterOn).shared === (new LaterOn).shared);
    wru.assert("lazy assigned properties are owned", nlo.hasOwnProperty("handlers"));
    delete nlo.handlers;
    wru.assert("by default, lazy assigned properties are removed", "handlers" in nlo && !nlo.hasOwnProperty("handlers"));
  }
},{
  name: "lazy patter configurability",
  test: function () {
    var
      oTest,
      oOther,
      source = redefine({}, {
        test: later(function () {
          return oTest = {};
        }),
        other: later({
          writable: true,     //we want be able to change it later on
          enumerable: true,   // shows in a forin
          configurable: false,// once defined cannot be deleted
          value: function () {
            return oOther = {};
          }
        })
      }),
      o = redefine.from(source)
    ;
    wru.assert("re defined", o.test && o.other);
    wru.assert("method test called and variable assigned", oTest === o.test && !!oTest);
    wru.assert("method other called and variable assigned", oOther === o.other && !!oOther);
    oTest = Object.getOwnPropertyDescriptor(o, "test");
    wru.assert("o.test has expected descriptor", !oTest.writable && !oTest.enumerable && oTest.configurable);
    oOther = Object.getOwnPropertyDescriptor(o, "other");
    wru.assert("o.other has expected descriptor", oOther.writable && oOther.enumerable && !oOther.configurable);
  }
},{
  name: "the Camera use case",
  test: function (reality) {var now;
    function Camera() {
      // by default
      this._power = false;
      // or if we don't want to expose it
      // via for/in loops
      // redefine(this, "_power", "off", {writable:true});
    }

    redefine(
      Camera.prototype, {

      // until we take a picture
      // we don't even need one
      storage: later(function(){
        // but once we do ...
        // a fresh new object per instance!
        return {};
        // this operation could be much more expensive
        // in therms of both initialization
        // and memory assignment
      }),

      // to take a picture we need an action
      // in this case represented by this method
      shot: function () {
        // we need a storage now!
        this.storage[
          now = Date.now()
        ] = JSON.stringify(reality);
        // done!
      },

      // a property that should always be "on" or "off"
      // and nothing else is acceptable as value
      power: as({
        // normalized through the getter
        get: function() {
          return this._power ? "on" : "off";
        },
        // and parsed properly through the setter
        set: function(onoff) {
          // if onoff is "off" or falsy we switch the camera off
          this._power = onoff === "off" ? false : !!onoff;
          // just imagine we can react here before
          // switching off concretely
        }
      })
    }, {
      enumerable: true
    });

    // the instance
    var olympic = new Camera;
    wru.assert("power is off", olympic.power === "off");
    olympic.power = "on";
    wru.assert("now is on", olympic.power);
    olympic.shot();
    wru.assert("and quite a quick shot!", !!olympic.storage[now]);
  }
},{
  name: "examples",
  test: function () {var assert = wru.assert;

// inline class example
var MyClass = redefine(
  // the constructor
  function MyClass() {
    // awesome stuff here!
  }
    // the original prototype
    .prototype,
  // the list of properties and methods
  {
    toString: function () {
      return "Hello There";
    }
  }
).constructor; // MyClass again

assert(String(new MyClass) === "Hello There");


// object from object
var source = {
  name: "source",
  method: function () {
    return this.name;
  }
};

// basic inheritance
var son = redefine.from(source);
assert(son.method() === "source");
assert(source.isPrototypeOf(son));

// overwrite inline
son = redefine.from(source, {name: "son"});
assert(son.method() === "son");

// object from constructor
function Source(){}
Source.prototype.name = "source";
Source.prototype.method = function () {
  return this.name;
};

son = redefine.from(Source);
assert(son.method() === "source");
assert(son instanceof Source);

son = redefine.from(Source, {name: "son"});
assert(son.method() === "son");
assert(son instanceof Source);



  }
},{
  name: "partial application",
  test: function() {
    var enumerable = redefine.using({
      enumerable: true
    });
    var o = enumerable({}, "test", true);
    wru.assert("correct value", o.test === true);
    wru.assert("enumerable", o.propertyIsEnumerable("test"));
    delete o.test;
    wru.assert("not configurable", o.test === true);
    o.test = "wut";
    wru.assert("not writable", o.test === true);
    o = redefine.using({
      configurable: true
    })({}, "test", true);
    wru.assert("correct value", o.test === true);
    wru.assert("not enumerable", !o.propertyIsEnumerable("test"));
    o.test = "wut";
    wru.assert("not writable", o.test === true);
    delete o.test;
    wru.assert("configurable", !o.test);
    o = redefine.using({
      configurable: true,
      enumerable: true
    })({}, "test", true);
    o.test = "wut";
    wru.assert("not writable", o.test === true);
    wru.assert("correct value", o.test === true);
    wru.assert("enumerable", o.propertyIsEnumerable("test"));
    delete o.test;
    wru.assert("configurable", !o.test);
    o = redefine.using({
      writable: true
    })({}, "test", true);
    o.test = "wut";
    wru.assert("not writable", o.test === "wut");
  }
},{
  name: 'Class',
  test: function () {
    var invoked = 0;
    var A = redefine.Class({
      statics: {
        instances: 0
      },
      constructor: function A() {
        invoked++;
        A.instances++;
      },
      prop: 'propA',
      method: function method() {
        return this.prop;
      }
    });
    wru.assert('still never invoked', invoked === 0);
    var a = new A;
    wru.assert('basic inheritance', a instanceof A);
    wru.assert('statics worked', A.instances === 1);
    wru.assert('method/prop there', a.method() === a.prop && a.prop === 'propA');
    var B = redefine.Class({
      extend: A,
      statics: {
        something: 'else'
      },
      constructor: function B() {
        B.something += '!';
      },
      prop: 'propB'
    });
    var b = new B;
    wru.assert('extended inheritance', b instanceof B && b instanceof A);
    wru.assert('A static inherited', B.instances++ === 1);
    wru.assert('A statics untouched', A.instances === 1);
    wru.assert('B statics writables', B.instances === 2);
    wru.assert('B statics worked', B.something === 'else!');
    wru.assert('method/prop there', b.method() === b.prop && b.prop === 'propB');
    wru.assert('nothing changed in a', a.method() === a.prop && a.prop === 'propA');
    var C = redefine.Class({
      extend: B,
      prop: 'propC',
      whatever: function () {
        return this.method();
      }
    });
    var c = new C;
    wru.assert('extended inheritance', c instanceof C && c instanceof B && c instanceof A);
    wru.assert('C statics worked', C.something === 'else!' && C.instances++ === 2 && B.instances === 2 && A.instances === 1);
    wru.assert('method/prop there', c.method() === c.prop && c.prop === 'propC');
    wru.assert('extra method', c.whatever() === c.method());
    wru.assert('nothing changed in b', b.method() === b.prop && b.prop === 'propB');
    wru.assert('nothing changed in a', a.method() === a.prop && a.prop === 'propA');
    wru.assert('all inherited methods the same', a.method === c.method && b.method === c.method);
    
    
    var A = redefine.Class({
      property: 'value'
    });
    var a = new A;
    wru.assert('property inherited', a.property === 'value');
    a.property = 123;
    wru.assert('property configurable', a.property === 123);
  }
},{
  name: 'mixin',
  test: function () {
    function O(){}
    var o = {a: function () {}, b: 'b'};
    O.prototype.c = function () {};
    var M = redefine.Class({
      mixin: O
    }).prototype;
    wru.assert('one argument as constructor', M.c === O.prototype.c);
    M = redefine.Class({
      mixin: o
    }).prototype;
    wru.assert('one argument as object', M.a === o.a && M.b === o.b);
    M = redefine.Class({
      mixin: [o, O]
    }).prototype;
    wru.assert(
      'multiple arguments, different types',
      M.c === O.prototype.c && M.a === o.a && M.b === o.b
    );
  }
},{
  name: 'mixin as function',
  test: function () {
    function method(){}
    var O = function (){
      this.method = method;
    };
    var M = redefine.Class({
      mixin: O
    }).prototype;
    wru.assert('mixin not added', M.method !== method);
    O.type = 'mixin';
    M = redefine.Class({
      mixin: O
    }).prototype;
    wru.assert('mixin added', M.method === method);
    O = function mixin(){
      return {whatever: method};
    };
    M = redefine.Class({
      mixin: O
    }).prototype;
    wru.assert('mixin added with objects too', M.whatever === method);
  }
},{
  name: 'passing arguments',
  test: function () {

    var cC = redefine.Class;

    function A(name) {
      this.name = name;
    }

    var B = cC({
      extend: A,
      constructor: function B(name, age) {
        this.super(name);
        this.age = age;
      }
    });

    var me = new B("Andrea", 34);
    wru.assert(
      "all properties are OK",
      me.name === "Andrea" &&
      me.age === 34
    );

    if ((function a(){}).name) {
      wru.assert(B.name === "B");
    }
  }
},{
  name: 'all the objects',
  test: function () {
          redefine.super(Object.prototype);
    var results = [];
    function A(){}
    A.prototype.hello = function () {
      results.push("hello from A");
    };
    A.prototype.sayWhat = function () {
      results.push("I said hello from A");
    };

    function B(){}
    (B.prototype = new A).constructor = B;
    B.prototype.hello = function () {
      this.super();
      results.push("hello from B");
    };

    function C(){}
    (C.prototype = new B).constructor = C;
    C.prototype.hello = function () {
      this.super();
      results.push("hello from C");
    };
    C.prototype.sayWhat = function () {
      this.super();
      results.push("I said hello from C");
    };

    function D(){}
    (D.prototype = new C).constructor = D;
    D.prototype.hello = function () {
      this.super();
      results.push("hello from D");
    };

    (new D).hello();
    (new D).sayWhat();

    wru.assert("all executed", results.length === 6);
    wru.assert("in the right order",
      results.shift() === "hello from A" &&
      results.shift() === "hello from B" &&
      results.shift() === "hello from C" &&
      results.shift() === "hello from D" &&
      results.shift() === "I said hello from A" &&
      results.shift() === "I said hello from C"
    );
  }
},{
  name: 'detached .super()',
  test: function () {
    function A(Constructor){
      return this instanceof Constructor;
    }
    var B = redefine.Class({
      extend: A,
      constructor: function () {
        var bound = this.super.bind(this);
        setTimeout(wru.async(function(){
          wru.assert('everything worked as expected', bound(B));
        }), 10);
      }
    });
    new B;
  }
},{
  name: 'bound methods',
  test: function () {
    var C = redefine.Class({
      method1: function () {
        return 'method1';
      },
      method2: function () {
        return 'method2';
      }
    });
    var c = new C,
        method1 = c.bound('method1'),
        method2 = c.bound('method2');
    wru.assert('not undefined', !!method1 && !!method2);
    wru.assert('same bound object 1', c.bound('method1') === method1);    
    wru.assert('same bound object 2', c.bound('method2') === method2);
  }
},{
  name: 'bound as export',
  test: function () {
    var C = redefine.Class({
      method1: function () {
        return 'method1';
      },
      method2: function () {
        return 'method2';
      }
    });
    var c = new C,
        method1 = redefine.bound(c, 'method1'),
        method2 = redefine.bound(c, 'method2');
    wru.assert('not undefined', !!method1 && !!method2);
    wru.assert('same bound object 1', c.bound('method1') === method1);    
    wru.assert('same bound object 2', redefine.bound(c, 'method2') === method2);
  }
},{
  name: 'clone',
  test: function () {
    function A() {
      var random = Math.random();
      Object.defineProperty(this, 'random', {
        get: function () {
          return random;
        }
      });
    }

    A.prototype.test = true;
    var a1 = new A,
        a2 = redefine.clone(a1);

    wru.assert('inheritance', a2 instanceof A);
    wru.assert('same getter', a2.random === a1.random);
  }
}]);