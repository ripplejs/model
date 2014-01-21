var observable = require('observable');
var assert = require('assert');
var Model;

describe('Observable', function(){

  beforeEach(function(){
    Model = observable();
  });

  it('should set properties in the constructor', function(){
    var model = new Model({ 'foo' : 'bar' });
    assert( model.get('foo') === 'bar' );
  })

  it('should set key and value', function(){
    var model = new Model();
    model.set('foo', 'bar');
    assert( model.attributes.foo === 'bar' );
  });

  it('should set key and value with an object', function(){
    var model = new Model();
    model.set({ 'foo' : 'bar' });
    assert( model.attributes.foo === 'bar' );
  });

  it('should emit change events', function(){
    var match = false;
    var model = new Model();
    model.on('change:foo', function(){
      match = true;
    });
    model.set('foo', 'bar');
    assert(match === true);
  });

  it('should set properties in constructor', function(){
    var obj = new Model({ 'foo':'bar' });
    assert( obj.get('foo') === 'bar' );
  });

  it('should set nested properties', function(){
    var model = new Model();
    model.set('foo.bar', 'baz');
    assert( model.attributes.foo.bar === 'baz' );
  });

  it('should get nested properties', function(){
    var model = new Model();
    model.set('foo', {
      bar: 'baz'
    });
    assert( model.get('foo.bar') === 'baz' );
  });

  it('should return undefined for missing nested properties', function(){
    var model = new Model();
    model.set('razz.tazz', 'bar');
    assert( model.get('foo') === undefined );
    assert( model.get('foo.bar') === undefined );
    assert( model.get('razz.tazz.jazz') === undefined );
  })

  it('should emit change events for nested properties', function(){
    var match = 0;
    this.model.set('foo.bar', 'baz');
    this.model.on('change:foo.bar', function(){
      match += 1;
    });
    this.model.on('change:foo', function(){
      match += 1;
    });
    this.model.set('foo.bar', 'zab');
    assert( match === 2 );
  })

  it('should add computed properties', function(){
    Model.computed('three', ['one', 'two'], function(){
      return this.get('one') + this.get('two');
    });
    var model = new Model({
      one: 1,
      two: 2
    });
    assert(model.get('three') === 3);
  })

  it('should emit change events for computed properties', function(done){
    Model.computed('three', ['one', 'two'], function(){
      return this.get('one') + this.get('two');
    });
    var model = new Model({
      one: 1,
      two: 2
    });
    model.on('change:three', function(value){
      assert(value === 4);
      done();
    });
    model.set('one', 2);
  })

  it('should use the change method for binding to changes', function(done){
    var model = new Model();
    model.change('one', function(attr, value){
      assert(value === 1);
      done();
    });
    model.set('one', 1);
  })

  if('should bind to all changes using the method', function(done){
    var model = new Model();
    model.change(function(attr, value){
      assert(attr === 'one');
      assert(value === 1);
      done();
    });
    model.set('one', 1);
  });

  it('should return a method to unbind changes', function(){
    var called = 0;
    var model = new Model();
    var unbind = model.change('one', function(value){
      called += 1;
    });
    unbind();
    model.set('one', 1);
    assert(called === 0);
  })

  it('should bind to changes of multiple properties', function(){
    var called = 0;
    var model = new Model();
    model.change(['one', 'two'], function(attr, value){
      called += 1;
    });
    model.set('one', 1);
    assert(called === 1);
  })

  it('should accept defaults', function(){
    var Model = observable({ 'one': 1 });
    var model = new Model();
    assert(model.get('one') === 1);
  })

  it('should be able to override the defaults', function(){
    var Model = observable({ 'one': 1 });
    var model = new Model({ 'one': 2 });
    assert(model.get('one') === 2);
  })

});