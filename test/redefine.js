//remove:
var
  redefine = require('../src/redefine.js').redefine
;
//:remove

var
  redefine = redefine || _.redefine,
  as = redefine.as,
  from = redefine.from,
  later = redefine.later
;

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
    var shared = {};
    var assigned = false;
    redefine(LaterOn.prototype, {
      handlers: later(function () {
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
    wru.assert("handlers is unique per each instance", (new LaterOn).handlers !== nlo.handlers);
    wru.assert("but this is not true for shared", (new LaterOn).shared === (new LaterOn).shared);
    wru.assert("lazy assigned properties are owned", nlo.hasOwnProperty("handlers"));
    delete nlo.handlers;
    wru.assert("by default, lazy assigned properties are removed", "handlers" in nlo && !nlo.hasOwnProperty("handlers"));
  }
},{
  name: "the Camera use case",
  test: function (reality) {
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
          Date.now()
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
    wru.assert("and quite a quick shot!", !!olympic.storage[Date.now()]);
  }
}]);