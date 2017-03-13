import { toCollectionName } from 'ember-cli-mirage/utils/normalize-name';
import extend from '../utils/extend';
import assert from '../assert';
import Collection from './collection';
import _values from 'lodash/values';

/*
  The Model class. Notes:

  - We need to pass in modelName, because models are created with
    .extend and anonymous functions, so you cannot use
    reflection to find the name of the constructor.
*/

/*
  Constructor
*/
class Model {

  // TODO: schema and modelName now set statically at registration, need to remove
  constructor(schema, modelName, attrs, fks) {
    assert(schema, 'A model requires a schema');
    assert(modelName, 'A model requires a modelName');

    this._schema = schema;
    this.modelName = modelName;
    this.fks = fks || [];
    attrs = attrs || {};

    this._setupAttrs(attrs);
    this._setupRelationships(attrs);

    return this;
  }

  /**
   * Creates or saves the model.
   * @method save
   * @return this
   * @public
   */
  save() {
    let collection = toCollectionName(this.modelName);

    if (this.isNew()) {
      // Update the attrs with the db response
      this.attrs = this._schema.db[collection].insert(this.attrs);

      // Ensure the id getter/setter is set
      this._definePlainAttribute('id');

    } else {
      this._schema.db[collection].update(this.attrs.id, this.attrs);
    }

    this._saveAssociations();

    return this;
  }

  /**
   * Update the record in the db.
   * @method update
   * @param {String} key
   * @param {String} val
   * @return this
   * @public
   */
  update(key, val) {
    let attrs;
    if (key == null) {
      return this;
    }

    if (typeof key === 'object') {
      attrs = key;
    } else {
      (attrs = {})[key] = val;
    }

    Object.keys(attrs).forEach(function(attr) {
      this._definePlainAttribute(attr);
      this[attr] = attrs[attr];
    }, this);

    this.save();

    return this;
  }

  /**
   * Destroys the db record
   * @method destroy
   * @public
   */
  destroy() {
    if (this.isSaved()) {
      this._disassociateFromDependents();

      let collection = toCollectionName(this.modelName);
      this._schema.db[collection].remove(this.attrs.id);
    }
  }

  /**
   * Boolean, true if the model has not been persisted yet to the db.
   *
   * Originally this method simply checked if the model had an id; however,
   * we let people create models with pre-specified ids. So, we have to
   * check whether the record is in the actual databse or not.
   *
   * @method isNew
   * @return {Boolean}
   * @public
   */
  isNew() {
    let hasDbRecord = false;
    let hasId = this.attrs.id !== undefined && this.attrs.id !== null;

    if (hasId) {
      let collectionName = toCollectionName(this.modelName);
      let record = this._schema.db[collectionName].find(this.attrs.id);
      if (record) {
        hasDbRecord = true;
      }
    }

    return !hasDbRecord;
  }

  /**
   * Boolean, opposite of `isNew`
   * @method isSaved
   * @return {Boolean}
   * @public
   */
  isSaved() {
    return !this.isNew();
  }

  /**
   * Reload a model’s data from the database.
   * @method reload
   * @return this
   * @public
   */
  reload() {
    if (this.id) {
      let collection = toCollectionName(this.modelName);
      let attrs = this._schema.db[collection].find(this.id);

      Object.keys(attrs)
        .filter(function(attr) {
          return attr !== 'id';
        })
        .forEach(function(attr) {
          this.attrs[attr] = attrs[attr];
        }, this);
    }

    // Clear temp associations
    this._tempAssociations = {};

    return this;
  }

  toJSON() {
    return this.attrs;
  }

  /**
   * Returns the association for the given key
   *
   * @method associationFor
   * @param key
   * @public
   */
  associationFor(key) {
    return this._schema.associationsFor(this.modelName)[key];
  }

  /**
   * Returns the inverse association, if it exists
   *
   * @method inverseAssociationFor
   * @param key
   * @public
   */
  inverseAssociationFor(key) {
    return this.associationFor(key).inverse();
  }

  associate(model, association) {
    let { key } = association;

    if (association.constructor.name === 'HasMany') {
      if (!this[key].includes(model)) {
        this[key].add(model);
      }
    } else {
      this[key] = model;
    }
  }

  disassociate(model, association) {
    let fk = association.getForeignKey();

    if (association.constructor.name === 'HasMany') {
      let i = this[fk].map(key => key.toString()).indexOf(model.id.toString());
      if (i > -1) {
        this.attrs[fk].splice(i, 1);
      }
    } else {
      this.attrs[fk] = null;
    }
  }

  // Private
  /**
   * model.attrs represents the persistable attributes, i.e. your db
   * table fields.
   * @method _setupAttrs
   * @param attrs
   * @private
   */
  _setupAttrs(attrs) {
    // Verify no undefined associations are passed in
    Object.keys(attrs)
      .filter((key) => {
        let value = attrs[key];
        let isModelOrCollection = (value instanceof Model || value instanceof Collection);
        let isArrayOfModels = Array.isArray(value) && value.length && value.every(item => item instanceof Model);

        return isModelOrCollection || isArrayOfModels;
      })
      .forEach((key) => {
        let modelOrCollection = attrs[key];

        assert(this.associationKeys.indexOf(key) > -1, `You're trying to create a ${this.modelName} model and you passed in a ${modelOrCollection.toString()} under the ${key} key, but you haven't defined that key as an association on your model.`);
      });

    // Filter out association keys
    let hash = Object.keys(attrs).reduce((memo, key) => {
      if (this.associationKeys.indexOf(key) === -1 && this.associationIdKeys.indexOf(key) === -1) {
        memo[key] = attrs[key];
      }
      return memo;
    }, {});

    // Ensure fks are there
    this.fks.map(function(fk) {
      hash[fk] = attrs[fk] !== undefined ? attrs[fk] : null;
    });

    this.attrs = hash;

    // define plain getter/setters for non-association keys
    Object.keys(hash).forEach(function(attr) {
      if (this.associationKeys.indexOf(attr) === -1 && this.associationIdKeys.indexOf(attr) === -1) {
        this._definePlainAttribute(attr);
      }
    }, this);
  }

  /**
   * Define getter/setter for a plain attribute
   * @method _definePlainAttribute
   * @param attr
   * @private
   */
  _definePlainAttribute(attr) {

    // Ensure the property hasn't already been defined
    let existingProperty = Object.getOwnPropertyDescriptor(this, attr);
    if (existingProperty && existingProperty.get) {
      return;
    }

    // Ensure the attribute is on the attrs hash
    if (!this.attrs.hasOwnProperty(attr)) {
      this.attrs[attr] = null;
    }

    // Define the getter/setter
    Object.defineProperty(this, attr, {
      get() {
        return this.attrs[attr];
      },
      set(val) {
        this.attrs[attr] = val;
        return this;
      }
    });
  }

  /**
   * Foreign keys get set on attrs directly (to avoid potential recursion), but
   * model references use the setter.
   *
   * We validate foreign keys during instantiation.
   *
   * @method _setupRelationships
   * @param attrs
   * @private
   */
  _setupRelationships(attrs) {
    let foreignKeysHash = Object.keys(attrs).reduce((memo, attr) => {
      if (this.associationIdKeys.indexOf(attr) > -1 || this.fks.indexOf(attr) > -1) {
        memo[attr] = attrs[attr];
      }
      return memo;
    }, {});

    Object.keys(foreignKeysHash).forEach(function(attr) {
      let fk = foreignKeysHash[attr];
      if (fk !== undefined && fk !== null) {
        this._validateForeignKeyExistsInDatabase(attr, fk);
      }

      this.attrs[attr] = fk;
    }, this);

    let associationKeysHash = Object.keys(attrs).reduce((memo, attr) => {
      if (this.associationKeys.indexOf(attr) > -1) {
        memo[attr] = attrs[attr];
      }
      return memo;
    }, {});
    Object.keys(associationKeysHash).forEach(function(attr) {
      this[attr] = associationKeysHash[attr];
    }, this);
  }

  /**
   * Originally we validated this via association.setId method, but it triggered
   * recursion. That method is designed for updating an existing model's ID so
   * this method is needed during instantiation.
   *
   * @method _validateForeignKeyExistsInDatabase
   * @private
   */
  _validateForeignKeyExistsInDatabase(foreignKeyName, foreignKeys) {
    if (Array.isArray(foreignKeys)) {
      let associationModelName = Object.keys(this.hasManyAssociations)
        .map(key => this.hasManyAssociations[key])
        .filter(association => association.getForeignKey() === foreignKeyName)[0]
        .modelName;

      let found = this._schema.db[toCollectionName(associationModelName)].find(foreignKeys);
      assert(found.length === foreignKeys.length, `You're instantiating a ${this.modelName} that has a ${foreignKeyName} of ${foreignKeys}, but some of those records don't exist in the database.`);

    } else {
      let associationModelName = Object.keys(this.belongsToAssociations)
        .map(key => this.belongsToAssociations[key])
        .filter(association => association.getForeignKey() === foreignKeyName)[0]
        .modelName;

      let found = this._schema.db[toCollectionName(associationModelName)].find(foreignKeys);
      assert(found, `You're instantiating a ${this.modelName} that has a ${foreignKeyName} of ${foreignKeys}, but that record doesn't exist in the database.`);
    }
  }

  /**
   * Update associated children when saving a collection
   *
   * @method _saveAssociations
   * @private
   */
  _saveAssociations() {
    this._saveBelongsToAssociations();
    this._saveHasManyAssociations();
  }

  _saveBelongsToAssociations() {
    _values(this.belongsToAssociations).forEach(association => {
      this._disassociateFromOldInverses(association);
      this._saveNewAssociates(association);
      this._associateWithNewInverse(association);
    });
  }

  _saveHasManyAssociations() {
    _values(this.hasManyAssociations).forEach(association => {
      this._disassociateFromOldInverses(association);
      this._saveNewAssociates(association);
      this._associateWithNewInverses(association);
    });
  }

  _disassociateFromOldInverses(association) {
    if (association.constructor.name === 'HasMany') {
      this._disassociateFromHasManyInverses(association);
    } else if (association.constructor.name === 'BelongsTo') {
      this._disassociateFromBelongsToInverse(association);
    }
  }

  _disassociateFromHasManyInverses(association) {
    let { key } = association;
    let fk = association.getForeignKey();
    let inverse = association.inverse();
    let tempAssociation = this._tempAssociations && this._tempAssociations[key];
    let oldInversesExist = this.attrs[fk];

    if (inverse && tempAssociation && oldInversesExist) {
      // Disassociate currently persisted models that are no longer associated
      this._schema[toCollectionName(association.modelName)]
        .find(this.attrs[fk] || []) // TODO: prob should initialize hasMany fks with []
        .models
        .filter(model => !tempAssociation.includes(model)) // filter out models that will still be associated
        .forEach(model => {
          model.disassociate(this, inverse);
          model.save();
        });
    }
  }

  _disassociateFromBelongsToInverse(association) {
    let { key } = association;
    let fk = association.getForeignKey();
    let inverse = association.inverse();
    let tempAssociation = this._tempAssociations && this._tempAssociations[key];
    let oldInversesExist = this.attrs[fk];

    if (inverse && (tempAssociation !== undefined) && oldInversesExist) {
      // Disassociate currently persisted models that are no longer associated
      let model = this._schema[toCollectionName(association.modelName)]
        .find(this.attrs[fk]);

      model.disassociate(this, inverse);
      model._updateInDb(model.attrs);
    }
  }

  _disassociateFromDependents() {
    _values(this._schema.dependentAssociationsFor(this.modelName))
      .forEach(association => {
        association.disassociateAllDependentsFromTarget(this);
      });
  }

  _saveNewAssociates(association) {
    let { key } = association;
    let fk = association.getForeignKey();
    let tempAssociate = this._tempAssociations && this._tempAssociations[key];

    if (tempAssociate !== undefined) {
      this.__isSavingNewChildren = true;
      delete this._tempAssociations[key];

      if (tempAssociate instanceof Collection) {
        tempAssociate.models.forEach(child => {
          child.save();
        });

        this._updateInDb({ [fk]: tempAssociate.models.map(child => child.id) });
      } else {

        if (tempAssociate === null) {
          this._updateInDb({ [fk]: null });
        } else {
          tempAssociate.save();
          this._updateInDb({ [fk]: tempAssociate.id });
        }
      }

      this.__isSavingNewChildren = false;
    }
  }

  _associateWithNewInverse(association) {
    let fk = association.getForeignKey();
    let inverse = association.inverse();

    if (this[fk] && inverse && (inverse.constructor.name === 'BelongsTo') && !this.__isSavingNewChildren) {
      let inverseFk = inverse.getForeignKey();

      this._schema.db[toCollectionName(association.modelName)]
        .update(this[fk], { [inverseFk]: this.id });

    } else if (this[fk] && inverse && (inverse.constructor.name === 'HasMany') && !this.__isSavingNewChildren) {
      let inverseFk = inverse.getForeignKey();
      let inverseCollection = this._schema.db[toCollectionName(association.modelName)];
      let currentIdsForInverse = inverseCollection.find(this[fk])[inverse.getForeignKey()] || [];
      let newIdsForInverse = currentIdsForInverse;

      if (newIdsForInverse.indexOf(this.id) === -1) {
        newIdsForInverse.push(this.id);
      }

      inverseCollection.update(this[fk], { [inverseFk]: newIdsForInverse });
    }
  }

  _associateWithNewInverses(association) {
    let fk = association.getForeignKey();
    let inverse = association.inverse();

    // Associate new models
    if (inverse && (inverse.constructor.name === 'HasMany') && !this.__isSavingNewChildren) {
      this._schema[toCollectionName(association.modelName)]
        .find(this[fk])
        .models
        .forEach(model => {
          let inverseFk = inverse.getForeignKey();
          let ownerId = this.id;
          let inverseCollection = this._schema.db[toCollectionName(model.modelName)];
          let currentIdsForInverse = inverseCollection.find(model.id)[inverse.getForeignKey()] || [];
          let newIdsForInverse = currentIdsForInverse;

          if (newIdsForInverse.indexOf(ownerId) === -1) {
            newIdsForInverse.push(ownerId);
          }

          inverseCollection.update(model.id, { [inverseFk]: newIdsForInverse });
        });
    } else if (inverse && (inverse.constructor.name === 'BelongsTo') && !this.__isSavingNewChildren) {
      this._schema[toCollectionName(association.modelName)]
        .find(this[fk])
        .models
        .forEach(model => {
          let inverseFk = inverse.getForeignKey();
          let ownerId = this.id;
          let inverseCollection = this._schema.db[toCollectionName(model.modelName)];

          inverseCollection.update(model.id, { [inverseFk]: ownerId });
        });
    }
  }

  // Used to update data directly, since #save and #update can retrigger saves,
  // which can cause cycles with associations.
  _updateInDb(attrs) {
    this.attrs = this._schema.db[toCollectionName(this.modelName)].update(this.attrs.id, attrs);
  }

  /**
   * Simple string representation of the model and id.
   * @method toString
   * @return {String}
   * @public
   */
  toString() {
    return `model:${this.modelName}(${this.id})`;
  }
}

Model.extend = extend;
Model.findBelongsToAssociation = function(associationType) {
  return this.prototype.belongsToAssociations[associationType];
};

export default Model;
