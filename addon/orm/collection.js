import _isArray from 'lodash/lang/isArray';

/*
  An array of models, returned from one of the schema query
  methods (all, find, where). Knows how to update and destroy its models.
*/
var Collection = function(modelName, ...args) {
  if (!modelName || typeof modelName !== 'string') {
    throw 'You must pass a `modelName` into a Collection';
  }
  this.modelName = modelName;

  if (_isArray(args[0])) {
    args = args[0];
  }
  this.push.apply(this, args);

  this.update = function(key, val) {
    this.forEach((model) => {
      model.update(key, val);
    });
  };

  this.destroy = function() {
    this.forEach((model) => {
      model.destroy();
    });
  };

  this.save = function() {
    this.forEach((model) => {
      model.save();
    });
  };

  this.reload = function() {
    this.forEach((model) => {
      model.reload();
    });
  };

  this.mergeCollection = function(collection) {
    collection.forEach((model) => {
      this.push(model);
    });

    return this;
  };

  return this;
};

Collection.prototype = Object.create(Array.prototype);

export default Collection;
