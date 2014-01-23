var observable = require('observer');
var assert = require('assert');
var model;

describe('Observer', function(){

  it('should set properties in the constructor', function(){
    model = observable({ 'foo' : 'bar' });
    assert( model.get('foo') === 'bar' );
  })

  it('should set key and value', function(){
    model = observable();
    model.set('foo', 'bar');
    assert( model.get('foo') === 'bar' );
  });

  it('should set key and value with an object', function(){
    model = observable();
    model.set({ 'foo' : 'bar' });
    assert( model.get('foo') === 'bar' );
  });

  it('should emit change events', function(){
    var match = false;
    model = observable();
    model.change('foo', function(){
      match = true;
    });
    model.set('foo', 'bar');
    assert(match === true);
  });

  it('should set properties in constructor', function(){
    var obj = observable({ 'foo':'bar' });
    assert( obj.get('foo') === 'bar' );
  });

  it('should set nested properties', function(){
    model = observable();
    model.set('foo.bar', 'baz');
    assert( model.get('foo').bar === 'baz' );
  });

  it('should get nested properties', function(){
    model = observable();
    model.set('foo', {
      bar: 'baz'
    });
    assert( model.get('foo.bar') === 'baz' );
  });

  it('should return undefined for missing nested properties', function(){
    model = observable();
    model.set('razz.tazz', 'bar');
    assert( model.get('foo') === undefined );
    assert( model.get('foo.bar') === undefined );
    assert( model.get('razz.tazz.jazz') === undefined );
  })

  describe('events for nested properties', function(){
    model;

    beforeEach(function(){
      model = observable({
        foo: {
          bar: 'baz'
        }
      });
    });

    it('should emit events for the bottom edge', function(done){
      model.change('foo.bar', function(val){
        done();
      });
      model.set('foo.bar', 'zab');
    })

    it('should emit events in the middle', function(){
      var called = false;
      model.change('foo', function(val){
        called = true;
      });
      model.set('foo.bar', 'zab');
      assert(called === true);
    })

    it.skip('should emit events', function(done){
      model.change(function(val){
        done();
      });
      model.set('foo.bar', 'zab');
    })

    it('should not emit events if the value has not changed', function(){
      var called = 0;
      model.set('foo.bar', 'zab');
      model.change('foo', function(val){
        called++;
      });
      model.change('foo.bar', function(val){
        called++;
      });
      model.set('foo', {
        bar: 'zab'
      });
      assert(called === 0);
    })

  })

  describe.skip('when properties are removed', function(){

  })

  it('should be able to do computed properties', function(){
    model = observable({
      one: 1,
      two: 2
    });
    model.computed('three', ['one', 'two'], function(){
      return this.get('one') + this.get('two');
    });
    assert(model.get('three') === 3);
  })

  it('should emit change events for computed properties', function(done){
    model = observable({
      one: 1,
      two: 2
    });
    model.computed('three', ['one', 'two'], function(){
      return this.get('one') + this.get('two');
    });
    model.change('three', function(change){
      assert(change === 4);
      done();
    });
    model.set('one', 2);
  })

  it('should use the change method for binding to changes', function(done){
    model = observable();
    model.change('one', function(change){
      assert(change === 1);
      done();
    });
    model.set('one', 1);
  })

  if('should bind to all changes using the method', function(done){
    model = observable();
    model.watch(function(attr, value){
      assert(attr === 'one');
      assert(value === 1);
      done();
    });
    model.set('one', 1);
  });

  it('should return a method to unbind changes', function(){
    var called = 0;
    model = observable();
    var unbind = model.change('one', function(value){
      called += 1;
    });
    unbind();
    model.set('one', 1);
    assert(called === 0);
  })

  it('should bind to changes of multiple properties', function(){
    var called = 0;
    model = observable();
    model.change(['one', 'two'], function(attr, value){
      called += 1;
    });
    model.set('one', 1);
    assert(called === 1);
  })

  it('should unbind to changes of multiple properties', function(){
    var called = 0;
    model = observable();
    var unbind = model.change(['one', 'two'], function(attr, value){
      called += 1;
    });
    unbind();
    model.set('one', 1);
    model.set('two', 1);
    assert(called === 0);
  })

  describe('watching arrays', function(){
    var items;

    beforeEach(function(){
      model = observable({ items: [1,2,3] });
    })

    it('should watch for items being removed', function(done){
      model.change('items', function(change){
        assert(change.type === "remove");
        assert(change.value[0] === 3);
        assert(model.get('items').length === 2);
        done();
      });
      model.get('items').pop();
    })

    it('should watch for items being added', function(done){
      var something = {};
      model.change('items', function(change){
        assert(change.type === 'add');
        assert(change.value[0] === something);
        assert(model.get('items').length === 4);
        done();
      });
      model.get('items').push(something);
    })

    it('should watch for items being sorted', function(done){
      var something = {};
      model.change('items', function(change){
        assert(change.type === 'sort');
        done();
      });
      model.get('items').sort();
    })

  });

});