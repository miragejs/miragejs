import { singularize, pluralize, camelize, dasherize } from '../utils/inflector';
import Association from './associations/association';
import Collection from './collection';
import _isArray from 'lodash/lang/isArray';
import _forIn from 'lodash/object/forIn';
import _includes from 'lodash/collection/includes';
import assert from '../assert';

/**
 * @class Schema
 * @constructor
 * @public
 */
export default class Schema {

  constructor(db, modelsMap = {}) {
    assert(db, 'A schema requires a db');

    this.db = db;
    this._registry = {};
    this.registerModels(modelsMap);
  }

  /**
   * @method registerModels
   * @param hash
   * @public
   */
  registerModels(hash = {}) {
    _forIn(hash, (model, key) => {
      this.registerModel(key, hash[key]);
    });
  }

  /**
   * @method registerModel
   * @param type
   * @param ModelClass
   * @public
   */
  registerModel(type, ModelClass) {
    let camelizedModelName = camelize(type);

    // Avoid mutating original class, because we may want to reuse it across many tests
    ModelClass = ModelClass.extend();

    // Store model & fks in registry
    this._registry[camelizedModelName] = this._registry[camelizedModelName] || { class: null, foreignKeys: [] }; // we may have created this key before, if another model added fks to it
    this._registry[camelizedModelName].class = ModelClass;

    // Set up associations
    ModelClass.prototype.hasManyAssociations = {};   // a registry of the model's hasMany associations. Key is key from model definition, value is association instance itself
    ModelClass.prototype.belongsToAssociations = {}; // a registry of the model's belongsTo associations. Key is key from model definition, value is association instance itself
    ModelClass.prototype.associationKeys = [];       // ex: address.user, user.addresses
    ModelClass.prototype.associationIdKeys = [];     // ex: address.user_id, user.address_ids. may or may not be a fk.

    for (let associationProperty in ModelClass.prototype) {
      if (ModelClass.prototype[associationProperty] instanceof Association) {
        let association = ModelClass.prototype[associationProperty];
        association.key = associationProperty;
        association.modelName = association.modelName || dasherize(singularize(associationProperty));
        association.ownerModelName = dasherize(camelizedModelName);

        // Update the registry with this association's foreign keys. This is
        // essentially our "db migration", since we must know about the fks.
        let result = association.getForeignKeyArray();
        let [ fkHolder, fk ] = result;
        this._addForeignKeyToRegistry(fkHolder, fk);

        // Augment the Model's class with any methods added by this association
        association.addMethodsToModelClass(ModelClass, associationProperty, this);
      }
    }

    // Create a db collection for this model, if doesn't exist
    let collection = pluralize(camelizedModelName);
    if (!this.db[collection]) {
      this.db.createCollection(collection);
    }

    // Create the entity methods
    this[pluralize(camelizedModelName)] = {
      camelizedModelName,
      new: (attrs) => this.new(camelizedModelName, attrs),
      create: (attrs) => this.create(camelizedModelName, attrs),
      all: (attrs) => this.all(camelizedModelName, attrs),
      find: (attrs) => this.find(camelizedModelName, attrs),
      where: (attrs) => this.where(camelizedModelName, attrs),
      first: (attrs) => this.first(camelizedModelName, attrs)
    };

    return this;
  }

  /**
   * @method new
   * @param type
   * @param attrs
   * @public
   */
  new(type, attrs) {
    return this._instantiateModel(dasherize(type), attrs);
  }

  /**
   * @method create
   * @param type
   * @param attrs
   * @public
   */
  create(type, attrs) {
    return this.new(type, attrs).save();
  }

  /**
   * @method all
   * @param type
   * @public
   */
  all(type) {
    let collection = this._collectionForType(type);

    return this._hydrate(collection, dasherize(type));
  }

  /**
   * @method find
   * @param type
   * @param ids
   * @public
   */
  find(type, ids) {
    let collection = this._collectionForType(type);
    let records = collection.find(ids);

    if (_isArray(ids)) {
      assert(
        records.length === ids.length,
        `Couldn\'t find all ${pluralize(type)} with ids: (${ids.join(',')}) (found ${records.length} results, but was looking for ${ids.length})`
      );
    }

    return this._hydrate(records, dasherize(type));
  }

  /**
   * @method where
   * @param type
   * @param query
   * @public
   */
  where(type, query) {
    let collection = this._collectionForType(type);
    let records = collection.where(query);

    return this._hydrate(records, dasherize(type));
  }

  /**
   * @method first
   * @param type
   * @public
   */
  first(type) {
    let collection = this._collectionForType(type);
    let [ record ] = collection;

    return this._hydrate(record, dasherize(type));
  }

  /*
    Private methods
  */

  /**
   * @method _collectionForType
   * @param type
   * @private
   */
  _collectionForType(type) {
    let collection = pluralize(type);
    assert(
      this.db[collection],
      `You\'re trying to find model(s) of type ${type} but this collection doesn\'t exist in the database.`
    );

    return this.db[collection];
  }

  /**
   * @method _addForeignKeyToRegistry
   * @param type
   * @param fk
   * @private
   */
  _addForeignKeyToRegistry(type, fk) {
    this._registry[type] = this._registry[type] || { class: null, foreignKeys: [] };

    let fks = this._registry[type].foreignKeys;
    if (!_includes(fks, fk)) {
      fks.push(fk);
    }
  }

  /**
   * @method _instantiateModel
   * @param modelName
   * @param attrs
   * @private
   */
  _instantiateModel(modelName, attrs) {
    let ModelClass = this._modelFor(modelName);
    let fks = this._foreignKeysFor(modelName);

    return new ModelClass(this, modelName, attrs, fks);
  }

  /**
   * @method _modelFor
   * @param modelName
   * @private
   */
  _modelFor(modelName) {
    return this._registry[camelize(modelName)].class;
  }

  /**
   * @method _foreignKeysFor
   * @param modelName
   * @private
   */
  _foreignKeysFor(modelName) {
    return this._registry[camelize(modelName)].foreignKeys;
  }

  /**
   * Takes a record and returns a model, or an array of records
   * and returns a collection.
   * @method _hydrate
   * @param records
   * @param modelName
   * @private
   */
  _hydrate(records, modelName) {
    if (_isArray(records)) {
      let models = records.map(function(record) {
        return this._instantiateModel(modelName, record);
      }, this);
      return new Collection(modelName, models);
    } else if (records) {
      return this._instantiateModel(modelName, records);
    } else {
      return null;
    }
  }
}
