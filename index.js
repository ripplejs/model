var Observer = require('./lib/observer');
var type = require('type');

/**
 * Observable.
 *
 * Watch an objects properties for changes.
 *
 * Properties must be set using the `set` method for
 * changes to fire events.
 *
 * @param {Object}
 */
function Observable(obj){
  this.obj = obj || {};
  this.observers = {};
}

/**
 * Set an attribute to be computed and automatically
 * update when other keys are updated
 *
 * @param {String} key
 * @param {Array} dependencies
 * @param {Function} fn
 *
 * @return {Observable}
 */
Observable.prototype.computed = function(name, dependencies, fn) {
  var self = this;
  function update() {
    self.set(name, fn.call(self));
  }
  self.change(dependencies, update);
  update();
  return this;
};

/**
 * Get or set the observer for a key
 *
 * @param {String} key
 * @param {Observer} observer
 *
 * @api private
 * @return {void}
 */
Observable.prototype.observer = function(path) {
  var cache = this.observers;
  if(cache[path]) return cache[path];

  var observer = new Observer(this.obj, path);

  observer.on('change', function(paths){
    paths.forEach(function(name){
      if(!cache[name]) return;
      cache[name].dispatch();
    });
  });

  observer.on('remove', function(){
    delete cache[observer.path];
  });

  cache[path] = observer;
  return observer;
};

/**
 * Add a function to fire whenever a keypath changes.
 *
 * @param {String|Array} keys
 * @param {Function} fn Function to call on event
 *
 * @return {Function} Function to remove the change event
 */
Observable.prototype.change = function(keys, fn) {
  if(Array.isArray(keys) === false) keys = [keys];
  var self = this;
  var change = fn.bind(this);

  // Call this function whenever any of the keypaths change
  var fns = keys.map(function(key){
    return self.observer(key).change(change);
  });

  // Return a function to unbind all of the callbacks
  return function(){
    fns.forEach(function(fn){
      fn();
    });
  };
};

/**
 * Set a property using a keypath
 *
 * @param {String} key eg. 'foo.bar'
 * @param {Mixed} val
 */
Observable.prototype.set = function(key, val) {
  if( type(key) === 'object' ) {
    for(var name in key) this.set(name, key[name]);
    return this;
  }
  this.observer(key).set(val);
  return this;
};

/**
 * Get an attribute using a keypath
 *
 * @param {String} key
 *
 * @api public
 * @return {Mixed}
 */
Observable.prototype.get = function(key) {
  return this.observer(key).get();
};

/**
 * Make any object observerable
 *
 * @param {Object} obj
 *
 * @return {Object}
 */
exports = module.exports = function(obj) {
  obj = obj || {};
  if(obj.__observable__) return;
  var proxy = new Observable(obj);
  obj.__observable__ = proxy;
  obj.get = proxy.get.bind(proxy);
  obj.set = proxy.set.bind(proxy);
  obj.change = proxy.change.bind(proxy);
  obj.computed = proxy.computed.bind(proxy);
  proxy.obj = obj;
  return obj;
};

/**
 * Expose constructor for custom use-cases
 *
 * @type {Function}
 */
exports.Observable = Observable;
exports.Observer = Observer;