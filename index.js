var PathObserver = require('./lib/path');
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
  var paths = key.split('.').map(function(path){
    used.push(path);
    return used.join('.');
  });
  // paths.pop();
  return paths;
}

/**
 * Observer.
 *
 * Watch an objects properties for changes.
 *
 * Properties must be set using the `set` method for
 * changes to fire events.
 *
 * @param {Object}
 */
function Observer(obj){
  if(!(this instanceof Observer)) return new Observer(obj);
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
 * @return {Observer}
 */
Observer.prototype.computed = function(name, dependencies, fn) {
  var self = this;
  function update() {
    self.set(name, fn.call(self));
  }
  self.change(dependencies, update);
  update();
  return this;
};

/**
 * Create or get the observer for a path
 *
 * @param {String} path
 * @param {PathObserver} observer
 *
 * @api private
 * @return {PathObserver}
 */
Observer.prototype.path = function(path) {
  var cache = this.observers;
  if(cache[path]) return cache[path];

  var self = this;
  var observer = new PathObserver(this.obj, path);
  var paths = resolvePaths(path);

  /**
   * Whenever the path changes, we need to check all
   * the dependencies on this path and dispatch events
   * on them too. This seems shitty here.
   */
  observer.on('change', function(){
    paths.forEach(function(name){
      self.path(name).check();
    });
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
Observer.prototype.change = function(keys, fn) {
  if(Array.isArray(keys) === false) keys = [keys];
  var self = this;
  var change = fn.bind(this);

  // Call this function whenever any of the keypaths change
  var unbinders = keys.map(function(key){
    return self.path(key).change(change);
  });

  // Return a function to unbind all of the callbacks
  return function(){
    unbinders.forEach(function(unbind){
      unbind();
    });
  };
};

/**
 * Set a property using a keypath
 *
 * @param {String} key eg. 'foo.bar'
 * @param {Mixed} val
 */
Observer.prototype.set = function(key, val) {
  if( arguments.length === 1 ) {
    for(var name in key) this.set(name, key[name]);
    return this;
  }
  this.path(key).value(val);
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
Observer.prototype.get = function(path) {
  return this.path(path).value();
};

/**
 * Expose constructor for custom use-cases
 *
 * @type {Function}
 */
module.exports = Observer;