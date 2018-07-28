import { pluralize, camelize, dasherize } from '../utils/inflector';
import { toCollectionName, toModelName } from 'ember-cli-mirage/utils/normalize-name';
import Association from './associations/association';
import Collection from './collection';
import _assign from 'lodash/assign';
import _forIn from 'lodash/forIn';
import _includes from 'lodash/includes';
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
    this._dependentAssociations = { polymorphic: [] };
    this.registerModels(modelsMap);
    this.isSaving = {}; // a hash of models that are being saved, used to avoid cycles
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
    let modelName = dasherize(camelizedModelName);

    // Avoid mutating original class, because we may want to reuse it across many tests
    ModelClass = ModelClass.extend();

    // Store model & fks in registry
    // TODO: don't think this is needed anymore
    this._registry[camelizedModelName] = this._registry[camelizedModelName] || { class: null, foreignKeys: [] }; // we may have created this key before, if another model added fks to it
    this._registry[camelizedModelName].class = ModelClass;

    // TODO: set here, remove from model#constructor
    ModelClass.prototype.schema = this;
    ModelClass.prototype.modelName = modelName;
    // Set up associations
    ModelClass.prototype.hasManyAssociations = {};   // a registry of the model's hasMany associations. Key is key from model definition, value is association instance itself
    ModelClass.prototype.belongsToAssociations = {}; // a registry of the model's belongsTo associations. Key is key from model definition, value is association instance itself
    ModelClass.prototype.associationKeys = [];       // ex: address.user, user.addresses
    ModelClass.prototype.associationIdKeys = [];     // ex: address.user_id, user.address_ids
    ModelClass.prototype.dependentAssociations = []; // a registry of associations that depend on this model, needed for deletion cleanup.

    let fksAddedFromThisModel = {};
    for (let associationProperty in ModelClass.prototype) {
      if (ModelClass.prototype[associationProperty] instanceof Association) {
        let association = ModelClass.prototype[associationProperty];
        association.key = associationProperty;
        association.modelName = association.modelName || toModelName(associationProperty);
        association.ownerModelName = modelName;
        association.setSchema(this);

        // Update the registry with this association's foreign keys. This is
        // essentially our "db migration", since we must know about the fks.
        let [fkHolder, fk] = association.getForeignKeyArray();

        fksAddedFromThisModel[fkHolder] = fksAddedFromThisModel[fkHolder] || [];
        assert(
          !_includes(fksAddedFromThisModel[fkHolder], fk),
          `Your '${type}' model definition has multiple possible inverse relationships of type '${fkHolder}'.

          Please read the associations guide and specify explicit inverses: http://www.ember-cli-mirage.com/docs/v0.3.x/models/#associations`
        );
        fksAddedFromThisModel[fkHolder].push(fk);

        this._addForeignKeyToRegistry(fkHolder, fk);

        // Augment the Model's class with any methods added by this association
        association.addMethodsToModelClass(ModelClass, associationProperty);
      }
    }

    // Create a db collection for this model, if doesn't exist
    let collection = toCollectionName(modelName);
    if (!this.db[collection]) {
      this.db.createCollection(collection);
    }

    // Create the entity methods
    this[collection] = {
      camelizedModelName,
      new: (attrs) => this.new(camelizedModelName, attrs),
      create: (attrs) => this.create(camelizedModelName, attrs),
      all: (attrs) => this.all(camelizedModelName, attrs),
      find: (attrs) => this.find(camelizedModelName, attrs),
      findBy: (attrs) => this.findBy(camelizedModelName, attrs),
      where: (attrs) => this.where(camelizedModelName, attrs),
      none: (attrs) => this.none(camelizedModelName, attrs),
      first: (attrs) => this.first(camelizedModelName, attrs)
    };

    return this;
  }

  /**
   * @method modelFor
   * @param type
   * @public
   */
  modelFor(type) {
    return this._registry[type];
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
   * @method none
   * @param type
   * @public
   */
  none(type) {
    return this._hydrate([], dasherize(type));
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

    if (Array.isArray(ids)) {
      assert(
        records.length === ids.length,
        `Couldn't find all ${pluralize(type)} with ids: (${ids.join(',')}) (found ${records.length} results, but was looking for ${ids.length})`
      );
    }

    return this._hydrate(records, dasherize(type));
  }

  /**
   * @method findBy
   * @param type
   * @param attributeName
   * @public
   */
  findBy(type, query) {
    let collection = this._collectionForType(type);
    let records = collection.findBy(query);

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
    let [record] = collection;

    return this._hydrate(record, dasherize(type));
  }

  modelClassFor(modelName) {
    let model = this._registry[camelize(modelName)];

    assert(model, `Model not registered: ${modelName}`);

    return model.class.prototype;
  }

  /*
    This method updates the dependentAssociations registry, which is used to
    keep track of which models depend on a given association. It's used when
    deleting models - their dependents need to be looked up and foreign keys
    updated.

    For example,

        schema = {
          post: Model.extend(),
          comment: Model.extend({
            post: belongsTo()
          })
        };

        comment1.post = post1;
        ...
        post1.destroy()

    Deleting this post should clear out comment1's foreign key.

    Polymorphic associations can have _any_ other model as a dependent, so we
    handle them separately.
  */
  addDependentAssociation(association, modelName) {
    if (association.isPolymorphic) {
      this._dependentAssociations.polymorphic.push(association);
    } else {
      this._dependentAssociations[modelName] = this._dependentAssociations[modelName] || [];
      this._dependentAssociations[modelName].push(association);
    }
  }

  dependentAssociationsFor(modelName) {
    let directDependents = this._dependentAssociations[modelName] || [];
    let polymorphicAssociations = this._dependentAssociations.polymorphic || [];

    return directDependents.concat(polymorphicAssociations);
  }

  associationsFor(modelName) {
    let modelClass = this.modelClassFor(modelName);

    return _assign({}, modelClass.belongsToAssociations, modelClass.hasManyAssociations);
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
    let collection = toCollectionName(type);
    assert(
      this.db[collection],
      `You're trying to find model(s) of type ${type} but this collection doesn't exist in the database.`
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
   *
   * @method _hydrate
   * @param records
   * @param modelName
   * @private
   */
  _hydrate(records, modelName) {
    if (Array.isArray(records)) {
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
