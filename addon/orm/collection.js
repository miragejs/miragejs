import _invoke from 'lodash/collection/invoke';
import assert from '../assert';

/*
  An array of models, returned from one of the schema query
  methods (all, find, where). Knows how to update and destroy its models.
*/
export default class Collection {
  constructor(modelName, models = []) {
    assert(
      modelName && typeof modelName === 'string',
      'You must pass a `modelName` into a Collection'
    );

    this.modelName = modelName;
    this.models = models;
  }

  update(...args) {
    _invoke(this.models, 'update', ...args);

    return this;
  }

  destroy() {
    _invoke(this.models, 'destroy');

    return this;
  }

  save() {
    _invoke(this.models, 'save');

    return this;
  }

  reload() {
    _invoke(this.models, 'reload');

    return this;
  }

  filter(f) {
    let filteredModels = this.models.filter(f);

    return new Collection(this.modelName, filteredModels);
  }

  mergeCollection(collection) {
    this.models = this.models.concat(collection.models);

    return this;
  }
}
