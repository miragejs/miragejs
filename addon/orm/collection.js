import _isArray from 'lodash/lang/isArray';
import assert from '../assert';

const { forEach, filter, reduce, push, map, slice } = Array.prototype;
/*
  An array of models, returned from one of the schema query
  methods (all, find, where). Knows how to update and destroy its models.
*/

export default class Collection {
 constructor(modelName, ...args) {
  assert(
    modelName && typeof modelName === 'string',
    'You must pass a `modelName` into a Collection'
  );

  this.modelName = modelName;

  if (_isArray(args[0])) {
    args = args[0];
  }
  this.length = 0;
  if (args.length) {
    push.apply(this, args);
  }
 }

  update(key, val) {
    forEach.call(this, (model) => model.update(key, val));
    return this;
  }

  destroy() {
    forEach.call(this, (model) => model.destroy());
    return this;
  }

  save() {
    forEach.call(this, (model) => model.save());
    return this;
  }

  reload() {
    forEach.call(this, (model) => model.reload());
    return this;
  }

  push() {
    push.apply(this, arguments);
  }

  map() {
    return map.apply(this, arguments);
  }


  forEach() {
    forEach.apply(this, arguments);
  }

  toArray() {
    return slice.apply(this);
  }

  reduce() {
    return reduce.apply(this, arguments);
  }

  filter() {
    var models = filter.apply(this, arguments);
    return new Collection(this.modelName, models);
  }

  mergeCollection(collection) {
    collection.forEach((model) => this.push(model));
    return this;
  }
}
