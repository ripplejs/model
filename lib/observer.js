var emitter = require('emitter');

function Observer(value, path) {
  this.previous = undefined;
  this.value = value;
  this.path = path;
}

emitter(Observer.prototype);

Observer.prototype.change = function(value){
  if(this.previous === value) return;
  this.previous = this.value;
  this.value = value;
  this.emit('change', value, this.previous);
};

module.exports = Observer;