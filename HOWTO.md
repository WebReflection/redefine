redefine VS ES5
===============

#### Create A Null Object

    // redefine
    var o = redefine.from(null);
    
    // ES5
    var o = Object.create(null);

#### Add Properties During Creation

    // redefine
    var o = redefine.from(null, {
      name: "object",
      toString: function () {
        return "Hi, I am " + this.name;
      }
    });
    
    // ES5
    var o = Object.create(null, {
      name: {
        value: "object"
      },
      toString: {
        value: function () {
          return "Hi, I am " + this.name;
        }
      }
    });

#### Add Configurable + Writable Properties During Creation

    // redefine
    var o = redefine.from(null, {
      name: "object",
      toString: function () {
        return "Hi, I am " + this.name;
      }
    }, {
      configurable : true,
      writable: true
    });
    
    // ES5
    var o = Object.create(null, {
      name: {
        configurable: true,
        writable: true,
        value: "object"
      },
      toString: {
        configurable: true,
        writable: true,
        value: function () {
          return "Hi, I am " + this.name;
        }
      }
    });

#### Add A Getter/Setter

    // redefine
    var o = redefine.from({}, {
      bday: Date.now(),
      age: redefine.as({
        set: function () {
          throw 'you cannot set your age';
        },
        get: function () {
          return parseInt(
            (Date.now() - this.bday) /
            (1000 * 60 * 60 * 24 * 365)
          ); // I know, no leap year
        }
      })
    });
    
    // ES5
    var o = Object.create({}, {
      bday: {
        value: Date.now()
      },
      age: {
        set: function () {
          throw 'you cannot set your age';
        },
        get: function () {
          return parseInt(
            (Date.now() - this.bday) /
            (1000 * 60 * 60 * 24 * 365)
          ); // I know, no leap year
        }
      }
    });

#### Real World Example: An Emitter Class
This a simplified `Emitter` class with completely memory safe logic.

    // generic basic Emitter constructor
    function Emitter(){}
    function emit(callback) {
      // just a recycled function
      callback(this);
    }

This is how we can define the prototype of the `Emitter` class.

    // redefine
    redefine(
      Emitter.prototype,
      {
        emit: function (type, data) {
          if (type in this._handlers) {
            this._handlers[type].forEach(emit, data);
          }
        },
        on: function (type, handler) {
          var list = this._getList(type);
          list.indexOf(handler) < 0 && list.push(handler);
          return this;
        },
        off: function (type, handler) {
          var list = this._getList(type),
              i = list.indexOf(handler);
          if (-1 < i) {
            list.splice(i, 1);
            if (!list.length) {
              delete this._handlers[type];
              if (!Object.keys(this._handler).length) {
                delete this._handlers;
              }
            }
          }
        },
        _getList: function (type) {
          return this._handlers[type] || (
            this._handlers[type] = []
          );
        },
        _handlers: redefine.later(function(){
          return {};
        })
      }
    );

The pattern used for the `_handlers` property only is an inherited getter replaced on demand with a direct property access, explained in details in [The Power Of Getters](http://webreflection.blogspot.com/2013/01/the-power-of-getters.html) post.

Long story short: we can create 100 instances of `Emitter` and the amount of objects will be exactly `100 + 2` included the `Emitter` function and its prototype. Only when used, the `_handlers` object is created once and set as property to avoid calling the getter per each access. When listeners are removed, both Array used as type list and `_handlers` are removed, if empty. In order to obtain the same behavior in ES5:

    // ES5
    Object.defineProperties(
      Emitter.prototype,
      {
        emit: {
          value: function (type, data) {
            if (type in this._handlers) {
              this._handlers[type].forEach(emit, data);
            }
          }
        },
        on: {
          value: function (type, handler) {
            var list = this._getList(type);
            list.indexOf(handler) < 0 && list.push(handler);
            return this;
          },
        }
        off: {
          value: function (type, handler) {
            var list = this._getList(type),
                i = list.indexOf(handler);
            if (-1 < i) {
              list.splice(i, 1);
              if (!list.length) {
                delete this._handlers[type];
                if (!Object.keys(this._handler).length) {
                  delete this._handlers;
                }
              }
            }
          }
        },
        _getList: {
          value: function (type) {
            return this._handlers[type] || (
              this._handlers[type] = []
            );
          }
        },
        _handlers: {
          get: function () {
            Object.defineProperty(
              this, "_handlers", {
                configurable: true,
                value: {}
              }
            );
            return this._handlers;
          }
        }
      }
    );













