var emitter = require('emitter');
var Events = require('emitter-manager');
var wrap = require('array').wrap;
var equals = require('equals');
var type = require('type');
var keypath = require('keypath');

/**
 * Takes a path like ‘foo.bar.baz’ and returns
 * an array we can iterate over for all parts.
 * eg. [‘foo’, ‘foo.bar’, ‘foo.bar.baz’]
 *
 * @param {String} key
 *
 * @return {Array}
 */
function resolvePaths(key) {
  var used = [];
  return key.split('.').map(function(path){
    used.push(path)
    return used.join('.');
  });
}

/**
 * Create a new observer for a value
 *
 * @param {Mixed} value
 * @param {String} path
 */
function Observer(obj, path) {
  this.obj = obj;
  this.path = path;
  this.paths = resolvePaths(path);
  this.events = new Events();
  this.watch(this.get());
}

/**
 * Mixin
 */
emitter(Observer.prototype);

/**
 * Check to see if this observer is watching a path
 *
 * @param {String} path
 *
 * @return {Boolean}
 */
Observer.prototype.hasPath = function(path) {
  return this.paths.indexOf(path) > -1;
};

/**
 * Watch an array for changes
 *
 * @param {Array} arr
 *
 * @api private
 * @return {void}
 */
Observer.prototype.watch = function(arr) {
  if(type(arr) !== 'array') return;
  var self = this;
  wrap(arr);

  this.events.on(arr, 'add', function(added){
    self.emit('change', {
      type: 'add',
      value: added
    });
  });

  this.events.on(arr, 'remove', function(removed){
    self.emit('change', {
      type: 'remove',
      value: removed
    });
  });

  this.events.on(arr, 'sort', function(){
    self.emit('change', {
      type: 'sort'
    });
  });

};

/**
 * Unwatch an array for changes
 *
 * @param {Array} arr
 *
 * @api private
 * @return {void}
 */
Observer.prototype.unwatch = function(arr) {
  if(type(arr) !== 'array') return;
  this.events.off(arr, 'add');
  this.events.off(arr, 'remove');
  this.events.off(arr, 'sort');
};

/**
 * Get the value for this path
 *
 * @return {Mixed}
 */
Observer.prototype.get = function() {
  return keypath.get(this.obj, this.path);
};

/**
 * Announce changes. It won't do anything
 * if the value hasn't actually changed
 *
 * @param {Mixed} value
 *
 * @api public
 * @return {void}
 */
Observer.prototype.set = function(newValue){
  var currentValue = this.get();
  if(equals(newValue, currentValue)) return;
  this.unwatch(currentValue);
  this.watch(newValue);
  keypath.set(this.obj, this.path, newValue);
  this.emit('change', this.paths, newValue);
};

/**
 * Dispatch changes
 *
 * @return {void}
 */
Observer.prototype.dispatch = function(){
  var value = this.get();
  if(value === undefined) {
    this.emit('remove');
    this.remove();
    return;
  }
  this.emit('dispatch', value);
};

/**
 * Call a function when this keypath changes
 *
 * @param {Function} fn
 *
 * @return {void}
 */
Observer.prototype.change = function(fn) {
  var self = this;
  this.on('dispatch', fn);
  return function(){
    self.off('dispatch', fn);
  };
};

module.exports = Observer;