var _ = this._ = function(_, Function, Object) {
  /*! (C) WebReflection *//** @preserve https://github.com/WebReflection/redefine */
  var
    // scoped shortcuts/constants
    CONFIGURABLE = "configurable",
    CONSTRUCTOR = "constructor",
    ENUMERABLE = "enumerable",
    EXTEND = "extend",
    GET = "get",
    SET = "set",
    STATICS = "statics",
    VALUE = "value",
    WRITABLE = "writable",

    // from Object || Object.prototype if _ has no polyfills;
    defineProperty = _.defineProperty || Object.defineProperty,
    hasOwnProperty = _.hasOwnProperty || Object.hasOwnProperty,
    getOwnPropertyDescriptor = _.getOwnPropertyDescriptor ||
                               Object.getOwnPropertyDescriptor,

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

    hasDescriptorBug = false,

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
    assign(descriptor, nullObject);
    if (
      hasOwnProperty.call(descriptor, GET) ||
      hasOwnProperty.call(descriptor, SET)
    ) {
      delete nullObject[WRITABLE];
      delete nullObject[VALUE];
    }
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
            lazy(object, key, value) : (
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

  function lazy(object, key, descriptor) {
    // trap these properties at definition time
    // and don't bother ever again!
    var
      callback = descriptor._,
      configurable = hasOwnProperty.call(descriptor, CONFIGURABLE) ?
        !!descriptor[CONFIGURABLE] : true,
      enumerable = hasOwnProperty.call(descriptor, ENUMERABLE) && descriptor[ENUMERABLE],
      writable = hasOwnProperty.call(descriptor, WRITABLE) && descriptor[WRITABLE],
      self
    ;
    descriptor[GET] = function get() {
      if(hasDescriptorBug) {
        descriptor = getOwnPropertyDescriptor(object, key);
        delete object[key];
      }
      nullObject[VALUE] = callback.call(self = this);
      nullObject[CONFIGURABLE] = configurable;
      nullObject[ENUMERABLE] = enumerable;
      nullObject[WRITABLE] = writable;
      defineProperty(self, key, nullObject);
      clear(nullObject);
      if (hasDescriptorBug) {
        assign(descriptor, nullObject);
        defineProperty(object, key, nullObject);
        clear(nullObject);
      }
      return self[key];
    };
    // to know more about this
    // see hasDescriptorBug = true part at the bottom
    if(hasDescriptorBug) {
      // unfortunately inevitable for Android 2.2 and 2.3 devices
      descriptor[CONFIGURABLE] = true;
    }
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

  // common simplified internal utility
  function createFromGeneric(object) {
    return create(isFunction(object) ?
        object.prototype : object
    );
  }

  // creates an instanceof the first argument
  // then applies properties, if specified
  // using defaults too
  function from(object, properties, defaults) {
    var instance = createFromGeneric(object);
    return properties ?
      redefine(instance, properties, defaults) :
      instance
    ;
  }

  // common simplified internal utility
  function isFunction(object) {
    return typeof object === "function";
  }

  // internal/private class
  // checked for lazy property assignment
  function Later(callback) {
    this._ = isFunction(callback) ?
      callback :
      assign(callback, this) || callback[VALUE]
    ;
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

  // create a partial implementation
  // with defaults pre assigned
  function using(defaults) {
    return function redefine(object, key, value) {
      typeof key == "string" ?
        define(object, key, value, defaults) :
        defineAll(object, key, defaults)
      ;
      return object;
    };
  }

  // Classes with semantics and power you need!
  // var Lib = redefine.Class({
  //
  //   extend: SuperLib,  // inheritance
  //
  //   statics: {         // statics
  //     someMethod: function () {},
  //     someProperty: 0
  //   },
  //                      // common definition
  //   method1: function () {},
  //   property1: null
  //
  //                      // constructor
  //   constructor: function Lib() {
  //     // implicit initialization
  //     // never invoked if extended via other classes
  //   }
  // });
  function Class(definition, defaults) {
    var
      constructor = hasOwnProperty.call(definition, CONSTRUCTOR) ?
        definition[CONSTRUCTOR] :
        function Constructor() {},
      statics = hasOwnProperty.call(definition, STATICS) && definition[STATICS],
      extend = hasOwnProperty.call(definition, EXTEND) && definition[EXTEND],
      key
    ;
    delete definition[CONSTRUCTOR];
    if (extend) {
      delete definition[EXTEND];
      redefine(
        constructor.prototype = createFromGeneric(extend),
        'constructor',
        constructor
      );
      if (isFunction(extend)) {
        for(key in extend) {
          if (hasOwnProperty.call(extend, key) &&
              key !== 'name' && key !== 'length'
          ) {
            defineProperty(
              constructor,
              key,
              getOwnPropertyDescriptor(extend, key)
            );
          }
        }
      }
    }
    if (statics) {
      delete definition[STATICS];
      defineAll(constructor, statics, {
        writable: true,
        enumerable: true
      });
    }
    defineAll(constructor.prototype, definition, defaults);
    return constructor;
  }

  // semantic exports
  redefine.Class = Class;
  redefine.as = as;
  redefine.from = from;
  redefine.later = later;
  redefine.using = using;
  redefine.defaults = {};

  // var redefine = require("redefine");
  if ("undefined" !== typeof module && module.exports) {
    (module.exports = redefine).redefine = redefine;
  }

  // there you are ...
  _.mixin ?
    // Lo-Dash or Underscore
    // _(object).redefine(property, value)
    // _(object).redefine(properties)
    // _.redefine(object, properties)
    _.mixin({redefine: redefine}) :
    _.redefine = redefine
  ;

  try {
    // Android 2.2 and 2.3 and webOS
    // plus Dolphin in older Androids
    // have a really weird bug whre inherited
    // getters cannot be set as value
    // in that case is a bit more complicated
    // to obtain a later() behavior
    // but at least it's consistent ^_^
    // Opera Mobile or all other browsers
    // won't be affected
    create(redefine({},{_:later(Object)}))._;
  } catch(o_O) {
    clear(nullObject);
    hasDescriptorBug = true;
  }

  return _;

}(_ || this, Function, Object);
