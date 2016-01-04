import _isArray from 'lodash/lang/isArray';

/*
  An array of models, returned from one of the schema query
  methods (all, find, where). Knows how to update and destroy its models.
*/

export default class Collection {
 constructor(modelName, ...args) {
  if (!modelName || typeof modelName !== 'string') {
    throw 'You must pass a `modelName` into a Collection';
  }

  this.modelName = modelName;

  if (_isArray(args[0])) {
    args = args[0];
  }
  this._models = args || [];
 }

  update(key, val) {
    this._models.forEach((model) => model.update(key, val));
    return this;
  }

  get length() {
    return this._models.length;
  }

  destroy() {
    this._models.forEach((model) => model.destroy());
    return this;
  }

  objectAt(index) {
    return this._models[index];
  }

  save() {
    this._models.forEach((model) => model.save());
    return this;
  }

  map() {
    return this._models.map.apply(this._models, arguments);
  }

  toArray() {
    return this._models.slice();
  }

  reduce() {
    return this._models.reduce.apply(this._models, arguments);
  }

  filter() {
    var models = this._models.filter.apply(this._models, arguments);
    return new Collection(this.modelName, models);
  }

  reload(){
    this._models.forEach((model) => model.save());
    return this;
  }

  mergeCollection(collection) {
    collection.forEach((model) => this._models.push(model));
    return this;
  }
}
