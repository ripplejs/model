var emitter = require('emitter');

function toArray(val) {
  if(!Array.isArray(val)) val = [val];
  return val;
}

module.exports = function(){

  function Observable(data){
    this.attributes = {};
    Observable.emit('construct', this);
    if(data) this.set(data);
  };

  emitter(Observable);
  emitter(Observable.prototype);

  Observable.computed = function(key, dependencies, fn) {
    this.on('construct', function(model){
      function update() {
        model.set(key, fn.call(model));
      }
      fn.call(model);
      model.change(dependencies, update);
    });
    return this;
  };

  Observable.prototype.change = function(key, fn) {
    if(arguments.length === 2) {
      var self = this;
      var attrs = toArray(key);
      function change(attr, value) {
        if(attrs.indexOf(attr) === -1) return;
        fn.call(self, attr, value);
      }
    }
    else {
      change = key.bind(this);
    }
    this.on('change', change);
    return function(){
      self.off('change', change);
    };
  };

  Observable.prototype.set = function(key, val) {
    if( typeof key !== "string" ) {
      for(var name in key) {
        this.set(name, key[name]);
      }
      return this;
    }
    var previous = this.get(key);
    if( previous === val ) return; // No change
    this._setPath(key, val);
    this.emit('change', key, val, previous);
    this.emit('change'+key, val, previous);
    return this;
  };

  Observable.prototype._setPath = function(path, value) {
    var parts = path.split('.');
    var target = this.attributes;
    var last = parts.pop();
    while(parts.length) {
      part = parts.shift();
      if(!target[part]) {
        target[part] = {};
      }
      target = target[part];
    }
    target[last] = value;
    this.emit('change:'+path, value, previousValue);
  };

  Observable.prototype._getPath = function(path) {
    var parts = path.split('.');
    var value = this.attributes;
    while(parts.length) {
      var part = parts.shift();
      value = value[part];
      if(value === undefined) parts.length = 0;
    }
    return value;
  };

  Observable.prototype.get = function(key) {
    return this._getPath(key);
  };

  return Observable;
};

exports.Observable = Observable;