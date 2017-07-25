import DbCollection from './db-collection';
import IdentityManager from './identity-manager';
import { singularize } from './utils/inflector';
import _cloneDeep from 'lodash/cloneDeep';

/**
 * The db, an identity map.
 * @class Db
 * @constructor
 * @public
 */
class Db {

  constructor(initialData, identityManagers) {
    this._collections = [];

    this.registerIdentityManagers(identityManagers);

    if (initialData) {
      this.loadData(initialData);
    }
  }

  /**
   * @method loadData
   * @param data
   * @public
   */
  loadData(data) {
    for (let key in data) {
      this.createCollection(key, _cloneDeep(data[key]));
    }
  }

  /**
   * @method dump
   * @public
   */
  dump() {
    return this._collections.reduce((data, collection) => {
      data[collection.name] = collection.all();

      return data;
    }, {});
  }

  /**
   * @method createCollection
   * @param name
   * @param initialData
   * @public
   */
  createCollection(name, initialData) {
    if (!this[name]) {
      let IdentityManager = this.identityManagerFor(name);
      let newCollection = new DbCollection(name, initialData, IdentityManager);

      Object.defineProperty(this, name, {
        get() {
          let recordsCopy = newCollection.all();

          ['insert', 'find', 'findBy', 'where', 'update', 'remove', 'firstOrCreate']
            .forEach(function(method) {
              recordsCopy[method] = function() {
                return newCollection[method](...arguments);
              };
            });

          return recordsCopy;
        }
      });

      this._collections.push(newCollection);

    } else if (initialData) {
      this[name].insert(initialData);
    }

    return this;
  }

  /**
   * @method createCollections
   * @param ...collections
   * @public
   */
  createCollections(...collections) {
    collections.forEach((c) => this.createCollection(c));
  }

  /**
   * @method emptyData
   * @public
   */
  emptyData() {
    this._collections.forEach((c) => c.remove());
  }

  /**
   * @method identityManagerFor
   * @param name
   * @public
   */
  identityManagerFor(name) {
    return this._identityManagers[singularize(name)] || this._identityManagers.application || IdentityManager;
  }

  /**
   * @method registerIdentityManagers
   * @public
   */
  registerIdentityManagers(identityManagers) {
    this._identityManagers = identityManagers || {};
  }
}

export default Db;
