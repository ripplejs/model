var observer = require('path-observer');
var emitter = require('emitter');

module.exports = function(){

  /**
   * ViewModel.
   *
   * Watch an objects properties for changes.
   *
   * Properties must be set using the `set` method for
   * changes to fire events.
   *
   * @param {Object}
   */
  function ViewModel(props){
    if(!(this instanceof ViewModel)) return new ViewModel(props);
    this.props = props || {};
    this.observer = observer(this.props);
    ViewModel.emit('construct', this);
  }

  /**
   * Mixins
   */
  emitter(ViewModel);

  /**
   * Set an attribute to be computed and automatically
   * update when other keys are updated
   *
   * @param {String} key
   * @param {Array} dependencies
   * @param {Function} fn
   *
   * @return {ViewModel}
   */
  ViewModel.computed = function(name, dependencies, fn) {
    ViewModel.on('construct', function(self){
      function callback() {
        var args = dependencies.map(function(key){
          return self.get(key);
        });
        return fn.apply(self, args);
      }
      function update() {
        self.set(name, callback());
      }
      self.change(dependencies, update);
      update();
    });
    return this;
  };

  /**
   * Add a function to fire whenever a keypath changes.
   *
   * @param {String|Array} keys
   * @param {Function} fn Function to call on event
   *
   * @return {Function} Function to remove the change event
   */
  ViewModel.prototype.change = function(key, fn) {
    var self = this;
    if(Array.isArray(key)) {
      var changes = key.map(function(k){
        return self.change(k, fn);
      });
      return function() {
        changes.forEach(function(change){
          change();
        });
      };
    }
    return this.observer(key).change(fn.bind(this));
  };

  /**
   * Set a property using a keypath
   *
   * @param {String} key eg. 'foo.bar'
   * @param {Mixed} val
   */
  ViewModel.prototype.set = function(key, val) {
    if( arguments.length === 1 ) {
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
  ViewModel.prototype.get = function(keypath) {
    return this.observer(keypath).get();
  };

  return ViewModel;
};