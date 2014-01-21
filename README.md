# observable

Watch an object and it's properties for changes, including nested properties.

## Install

```
component install ripplet/observable
```

## Example

```js
var observable = require('observable');

// Create a new observable object with these properties
var obj = observable({
  firstname: "Tom",
  lastname: "Dickson",
  items: [1, 2, 3],
  data: {
    height: '175cm'
  }
});

// Computed properties with dependencies
obj.computed('fullname', ['firstname', 'lastname'], function(){
  return this.get('firstname') + ' ' + this.get('lastname');
});

// Watch arrays for items added, removed or sorted
obj.change('items', function(){
  console.log('array changed');
});

// Watch computed properties for changes
obj.change('fullname', function(val){
  console.log(val);
});

// Watch nested properties for changes
obj.change('data.height', function(){
  console.log('height changed');
});

// Values must be changed with #set
obj.set('firstname', 'Richard');

// Get nested properties
obj.get('data.height'); // '175cm'

// Get computed properties
obj.get('fullname'); // 'Richard Dickson'

// Arrays can be used as normal
obj.get('items').push(4); // 'array changed'
```

Alternate syntax if you like `new` keywords:

```js
var Observable = require('observable');
var obj = new Observable({
  foo: 'bar'
});
```
