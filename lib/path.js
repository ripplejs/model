var emitter = require('emitter');
var wrap = require('observable-array').wrap;
var equals = require('equals');
var clone = require('clone');
var keypath = require('keypath');

/**
 * Takes an object and a path and announces
 * whenever the value at that path changes.
 *
 * If this path no longer exists it will announce
 * that it has been removed but not unbind.
 *
 * @param {Object} obj The object to watch
 * @param {String} path The keypath to the value 'foo.bar.baz'
 */
function PathObserver(obj, path) {
  this.obj = obj;
  this.path = path;
  this.check();
}

/**
 * Mixin
 */
emitter(PathObserver.prototype);

/**
 * Watch an array for changes
 *
 * @param {Array} arr
 *
 * @api private
 * @return {void}
 */
PathObserver.prototype.observeMutations = function(obj) {
  wrap(obj);
  var notify = this.notify.bind(this);

  function add(items){
    notify({
      type: 'add',
      value: items
    });
  }

  function remove(items){
    notify({
      type: 'remove',
      value: items
    });
  }

  function sort(items){
    notify({
      type: 'sort'
    });
  }

  // Whenever the array changes
  obj.on('add', add);
  obj.on('remove', remove);
  obj.on('sort', sort);

  // Remove all events if the value of
  // this keypath changes to another object
  this.once('change', function(){
    obj.off('add', add);
    obj.off('remove', remove);
    obj.off('sort', sort);
  });

};

/**
 * Has the path changed?
 *
 * @return {Boolean}
 */
PathObserver.prototype.dirty = function() {
  var current = this.value();

  // Changes to array will fire immediately
  // when array methods are fired.
  if(Array.isArray(current)) return false;

  return equals(this.previous, this.value()) === false;
};

/**
 * Get the value of the keypath
 *
 * @return {Mixed}
 */
PathObserver.prototype.value = function(val) {
  if(val) {
    keypath.set(this.obj, this.path, val);
    this.check(); // This will be automatic with object.observe
    return this;
  }
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
PathObserver.prototype.check = function() {
  var current = this.value();
  var previous = this.previous;
  var isArray = Array.isArray(current);
  if(isArray) this.observeMutations(current);
  if(!this.dirty()) return;
  this.previous = clone(current);
  this.notify(current, previous);
};

/**
 * Emits the change event that triggers callback
 * events in object watching for changes
 *
 * @api public
 * @return {void}
 */
PathObserver.prototype.notify = function() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift('change');
  this.emit.apply(this, args);
};

/**
 * Bind to changes on this path
 *
 * @param {Function} fn
 *
 * @return {Function}
 */
PathObserver.prototype.change = function(fn){
  var self = this;
  self.on('change', fn);
  return function(){
    self.off('change', fn);
  };
};

module.exports = PathObserver;