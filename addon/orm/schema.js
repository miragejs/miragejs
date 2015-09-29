import { singularize, pluralize, camelize } from '../utils/inflector';
import Collection from './collection';
import Association from './associations/association';

export default function(db) {

  if (!db) {
    throw 'Mirage: A schema requires a db';
  }

  this.db = db;
  this._registry = {};

  this.registerModels = function(hash) {
    var _this = this;

    Object.keys(hash).forEach(function(type) {
      _this.registerModel(type, hash[type]);
    });
  };

  this.registerModel = function(type, ModelClass) {
    var _this = this;
    type = camelize(type);

    // Store model & fks in registry
    this._registry[type] = this._registry[type] || {class: null, foreignKeys: []}; // we may have created this key before, if another model added fks to it
    this._registry[type].class = ModelClass;

    // Set up associations
    ModelClass.prototype.hasManyAssociations = {};   // a registry of the model's hasMany associations. Key is key from model definition, value is association instance itself
    ModelClass.prototype.belongsToAssociations = {}; // a registry of the model's belongsTo associations. Key is key from model definition, value is association instance itself
    ModelClass.prototype.associationKeys = [];       // ex: address.user, user.addresses
    ModelClass.prototype.associationIdKeys = [];     // ex: address.user_id, user.address_ids. may or may not be a fk.

    Object.keys(ModelClass.prototype).forEach(function(key) {
      if (ModelClass.prototype[key] instanceof Association) {
        var association = ModelClass.prototype[key];
        var associatedType = association.type || singularize(key);
        association.owner = type;
        association.target = associatedType;

        // Update the registry with this association's foreign keys. This is
        // essentially our "db migration", since we must know about the fks.
        var result = association.getForeignKeyArray();
        var fkHolder = result[0];
        var fk = result[1];
        _this._addForeignKeyToRegistry(fkHolder, fk);

        // Augment the Model's class with any methods added by this association
        association.addMethodsToModelClass(ModelClass, key, _this);
      }
    });

    // Create a db collection for this model, if doesn't exist
    var collection = pluralize(type);
    if (!this.db[collection]) {
      this.db.createCollection(collection);
    }

    // Create the entity methods
    this[type] = {
      new: this.new.bind(this, type),
      create: this.create.bind(this, type),
      all: this.all.bind(this, type),
      find: this.find.bind(this, type),
      where: this.where.bind(this, type)
    };

    return this;
  };

  this.new = function(type, attrs) {
    return this._instantiateModel(type, attrs);
  };

  this.create = function(type, attrs) {
    var collection = this._collectionForType(type);
    var augmentedAttrs = collection.insert(attrs);

    return this._instantiateModel(type, augmentedAttrs);
  };

  this.all = function(type) {
    var collection = this._collectionForType(type);

    return this._hydrate(collection, type);
  };

  this.find = function(type, ids) {
    var collection = this._collectionForType(type);
    var records = collection.find(ids);

    if (_.isArray(ids)) {
      if (records.length !== ids.length) {
        throw 'Couldn\'t find all ' + pluralize(type) + ' with ids: (' + ids.join(',') + ') (found ' + records.length + ' results, but was looking for ' + ids.length + ')';
      }
    }

    return this._hydrate(records, type);
  };

  this.where = function(type, query) {
    var collection = this._collectionForType(type);
    var records = collection.where(query);

    return this._hydrate(records, type);
  };

  /*
    Private methods
  */
  this._collectionForType = function(type) {
    var collection = pluralize(type);
    if (!this.db[collection]) {
      throw 'Mirage: You\'re trying to find model(s) of type ' + type + ' but this collection doesn\'t exist in the database.';
    }

    return this.db[collection];
  };

  this._addForeignKeyToRegistry = function(type, fk) {
    this._registry[type] = this._registry[type] || {class: null, foreignKeys: []};
    this._registry[type].foreignKeys.push(fk);
  };

  this._instantiateModel = function(type, attrs) {
    var ModelClass = this._modelFor(type);
    var fks = this._foreignKeysFor(type);

    return new ModelClass(this, type, attrs, fks);
  };

  this._modelFor = function(type) {
    return this._registry[type].class;
  };

  this._foreignKeysFor = function(type) {
    return this._registry[type].foreignKeys;
  };

  /*
    Takes a record and returns a model, or an array of records
    and returns a collection.
  */
  this._hydrate = function(records, type) {
    var _this = this;

    if (_.isArray(records)) {
      var models = records.map(function(record) {
        return _this._instantiateModel(type, record);
      });

      return new Collection(type, models);

    } else {
      var record = records;
      return !record ? null : this._instantiateModel(type, record);
    }
  };
}
