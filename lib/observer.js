var emitter = require('emitter');
var observable = require('array');

function isArray(arr) {
  return Array.isArray(arr);
}

/**
 * Create a new observer for a value
 *
 * @param {Mixed} value
 * @param {String} path
 */
function Observer(value, path) {
  if(isArray(value)) this._watchArray(value);
  this.previous = undefined;
  this.value = value;
  this.path = path;
}

emitter(Observer.prototype);

/**
 * Watch an array for changes
 *
 * @param {Array} arr
 *
 * @api private
 * @return {void}
 */
Observer.prototype._watchArray = function(arr) {
  var self = this;
  observable(arr);
  arr.on('add', function(added){
    self.emit('change', added, []);
  });
  arr.on('remove', function(removed){
    self.emit('change', [], removed);
  });
  arr.on('sort', function(){
    self.emit('change', [], [], true);
  });
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
Observer.prototype.change = function(value){
  this.previous = this.value;
  this.value = value;
  this.emit('change', value, this.previous);
};

module.exports = Observer;