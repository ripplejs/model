var emitter = require('emitter');
var Observer = require('./lib/observer');
var keypath = require('keypath');

/**
 * Observable.
 *
 * Watch an objects properties for changes.
 *
 * Properties must be set using the `set` method for
 * changes to fire events.
 *
 * @param {Object} data Pre-fill with data. This object will not be changed
 */
function Observable(data){
  this.attributes = {};
  this._observers = {};
  if(data) this.set(data);
};

/**
 * Mixins
 */
emitter(Observable.prototype);

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
 * Create a new observer for a keypath. Pulls from
 * a cache if it exists already
 *
 * @param {String} key
 *
 * @api private
 * @return {void}
 */
Observable.prototype.createObserver = function(key) {
  if(this.observer(key)) return this.observer(key);
  var value = this.get(key);
  var observer = new Observer(value, key);
  this.observer(key, observer);
  return observer;
}

/**
 * Get or set the observer for a key
 *
 * @param {String} key
 * @param {Observer} observer
 *
 * @api private
 * @return {void}
 */
Observable.prototype.observer = function(key, observer) {
  if(!observer) return this._observers[key];
  this._observers[key] = observer;
};

/**
 * Fire an method when any attribute changes
 *
 * @param {Function} fn
 *
 * @return {Function} Function to unbind
 */
Observable.prototype.watch = function(fn) {
  var self = this;
  fn = fn.bind(this);
  this.on('change', fn);
  return function(){
    self.off('change', fn);
  };
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
  if(typeof keys === "function") return this.watch(keys);
  if(Array.isArray(keys) === false) keys = [keys];
  var self = this;
  var change = fn.bind(this);
  var fns = keys.map(function(key){
    var observer = self.createObserver(key);
    observer.on('change', change);
    return function(){
      observer.off('change', change);
    };
  });
  return function(){
    fns.forEach(function(fn){
      fn();
    });
  };
};

/**
 * Fire changes for all parts of a keypath
 *
 * @param {String} key
 *
 * @api private
 * @return {void}
 */
Observable.prototype.update = function(key) {
  var parts = key.split('.');
  var current = [];
  var currentKey;
  var currentValue;
  var observer;
  while(parts.length) {
    current.push(parts.shift());
    currentKey = current.join('.');
    currentValue = this.get(currentKey);
    observer = this.observer(currentKey);
    if(observer) observer.change(currentValue);
  }
};

/**
 * Set a property using a keypath
 *
 * @param {String} key eg. 'foo.bar'
 * @param {Mixed} val
 */
Observable.prototype.set = function(key, val) {
  if( typeof key !== "string" ) {
    for(var name in key) this.set(name, key[name]);
    return this;
  }
  var previous = this.get(key);
  if( previous === val ) return; // No change
  keypath.set(this.attributes, key, val);
  this.emit('change', key, val, previous);
  this.update(key);
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
  return keypath.get(this.attributes, key);
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
  proxy.attributes = obj;
  return obj;
};

/**
 * Expose constructor for custom use-cases
 *
 * @type {Function}
 */
exports.Observable = Observable;