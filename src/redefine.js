/*

// example shortcuts
var
  redefine = _.redefine,
  as = redefine.as,
  from = redefine.from,
  later = redefine.later
;

function Camera() {
  // by default
  this._power = "off";
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
  }),

  // to take a picture we need an action
  // in this case represented by this method
  shoot: function () {
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

*/
var _ = this._ = function(_, Function, Object) {
  /*! (C) WebReflection *//** @preserve https://github.com/WebReflection/redefine */
  var
    // scoped shortcuts/constants
    CONFIGURABLE = "configurable",
    ENUMERABLE = "enumerable",
    GET = "get",
    SET = "set",
    VALUE = "value",
    WRITABLE = "writable",

    // from Object.prototype if _ was a new null;
    defineProperty = _.defineProperty || Object.defineProperty,
    hasOwnProperty = _.hasOwnProperty || Object.hasOwnProperty,

    // from _ enriched through other libraries or just Object.create
    create = _.create || _.inherit || Object.create,

    // ES5 descriptor properties
    commonProperties = [
      CONFIGURABLE,
      ENUMERABLE,
      GET,
      SET,
      VALUE,
      WRITABLE
    ],

    // delete all ES5 properties
    clear = Function("o", "delete o." +
      commonProperties.join(";delete o.") 
    ),

    // recycled object for a happier GC
    nullObject = create(null),
    valueObject = {},

    // defined later on
    i, assign, remove
  ;

  for(i = 0; i < commonProperties.length; i++) {
    commonProperties[i] = ["if(h.call(a,'", "'))b.", "=a.",";"].join(commonProperties[i]);
  }
  // assign only object own properties
  assign = Function("h","return function(a,b){" + commonProperties.join("") + "}")(hasOwnProperty);

  function defineMagic(object, key, defaults, descriptor) {
    assign(defaults || redefine.defaults || {}, nullObject);
    if (
      hasOwnProperty.call(descriptor, GET) ||
      hasOwnProperty.call(descriptor, SET)
    ) {
      delete nullObject[WRITABLE];
      delete nullObject[VALUE];
    }
    assign(descriptor, nullObject);
    defineProperty(object, key, nullObject);
    clear(nullObject);
  }

  // define a single property with a specific value
  function define(object, key, value, defaults) {
    defineMagic(
      object,
      key,
      defaults,
      value instanceof As ?
        value : (
          value instanceof Later ?
            lazy(key, value) : (
              valueObject[VALUE] = value, valueObject
            )
        )
    );
    delete valueObject[VALUE];
  }

  function defineAll(object, values, defaults) {
    // this is actually cheaper than an
    // Object.keys(values).forEach(callback)
    // it is also faster so ...
    for (var key in values) {
      hasOwnProperty.call(values, key) &&
      define(object, key, values[key], defaults);
    }
  }

  // returns boolean values for boolean descriptor properties
  function getDescriptorProperty(descriptor, key) {
    return hasOwnProperty.call(descriptor, key) && descriptor[key];
    /* with defaults is probably **not** a good idea
    // this code stays in case it comes out it was best idea ever ...
    return !!(hasOwnProperty.call(descriptor, key) ?
      descriptor[key] : redefine.defaults[key]
    );
    */
  }

  function lazy(key, descriptor) {
    // trap these properties at definition time
    // and don't bother ever again!
    var
      callback = descriptor.valueOf,
      // by default, configurable is true so it can be deleted
      // however, it is possible to make it not deletable once set
      // explicitly setting it as falsy
      configurable = hasOwnProperty.call(descriptor, CONFIGURABLE) ?
        !!descriptor[CONFIGURABLE] : true
      ,
      enumerable = getDescriptorProperty(descriptor, ENUMERABLE),
      writable = getDescriptorProperty(descriptor, WRITABLE),
      self
    ;
    // a function per prototype definition could be
    // more expensive during prototype definition
    // but full of wins per each instance of that function
    descriptor[GET] = function get() {
      nullObject[VALUE] = callback.call(self = this);
      nullObject[CONFIGURABLE] = configurable;
      nullObject[ENUMERABLE] = enumerable;
      nullObject[WRITABLE] = writable;
      defineProperty(self, key, nullObject);
      clear(nullObject);
      return self[key];
    };
    return descriptor;
  }

  // internal/private class
  // checked for descriptors
  function As(descriptor) {
    assign(descriptor, this);
  }

  // public As factory
  function as(descriptor) {
    return new As(descriptor);
  }

  // creates an instanceof the first argument
  // then applies properties, if specified
  // using defaults too
  function from(object, properties, defaults) {
    var instance = create(typeof object == "function" ?
      object.prototype : object
    );
    return properties ?
      redefine(instance, properties, defaults) :
      instance
    ;
  }

  // internal/private class
  // checked for lazy property assignment
  function Later(callback) {
    this.valueOf = callback;
  }

  // public Later factory
  function later(callback) {
    return new Later(callback);
  }

  // the actual exported library out there
  function redefine(
    object,   // an object where property/ies should be re/defined
    key,      // the property name or the object with all of them
    value,    // the property value or defaults, if key i san object
    defaults  // the optional defaults or undefined, if specified in value
  ) {
    // exactly same things:
    // obj <== redefine(obj, key, value[, defaults]);
    // obj <== redefine(obj, objProps[, defaults]);
    typeof key == "string" ?
      define(object, key, value, defaults) :
      defineAll(object, key, value)
    ;
    return object;
  }

  // semantic exports
  redefine.as = as;
  redefine.from = from;
  redefine.later = later;
  redefine.defaults = {};

  // there you are ...
  _.redefine = redefine;
  return _;

}(_ || this, Function, Object);
