# model

[![Build Status](https://travis-ci.org/ripplejs/model.png?branch=master)](https://travis-ci.org/ripplejs/model)

Watch an object and it's properties for changes, including nested properties.

## Install

```
component install ripplejs/model
```

## Example

```js
var model = require('model');

// Creates a new model contructor
var ViewModel = model();

// Create a new view-model object with these properties
var model = new ViewModel{
  firstname: "Tom",
  lastname: "Dickson",
  items: [1, 2, 3],
  data: {
    height: '175cm'
  }
});

// Watch arrays for items added, removed or sorted
model.change('items', function(){
  console.log('array changed');
});

// Watch computed properties for changes
model.change('fullname', function(val){
  console.log(val);
});

// Watch nested properties for changes
model.change('data.height', function(){
  console.log('height changed');
});

// Values must be changed with #set
model.set('firstname', 'Richard');

// Get nested properties
model.get('data.height'); // '175cm'

// Get computed properties
model.get('fullname'); // 'Richard Dickson'

// Arrays can be used as normal
model.get('items').push(4); // 'array changed'
```

