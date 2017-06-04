import { toCollectionName } from 'ember-cli-mirage/utils/normalize-name';
import extend from '../utils/extend';
import assert from '../assert';
import Collection from './collection';
import PolymorphicCollection from './polymorphic-collection';
import _values from 'lodash/values';
import _compact from 'lodash/compact';

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
   * Returns this model's inverse association for the given
   * model-type-association pair, if it exists.
   *
   * Example:

         post: Model.extend({
           comments: hasMany()
         }),
         comments: Model.extend({
           post: belongsTo()
         })

     post.inversefor(commentsPostAssociation) would return the
     `post.comments` association object.

     Originally we had association.inverse() but that became impossible with
     the addition of polymorphic models. Consider the following:

         post: Model.extend({
           comments: hasMany()
         }),
         picture: Model.extend({
           comments: hasMany()
         }),
         comments: Model.extend({
           commentable: belongsTo({ polymorphic: true })
         })

     `commentable.inverse()` is ambiguous - does it return
     `post.comments` or `picture.comments`? Instead we need to ask each model
     if it has an inverse for a given association. post.inverseFor(commentable)
     is no longer ambiguous.
   *
   *
   * @method hasInverseFor
   * @param {String} modelName The model name of the class we're scanning
   * @param {ORM/Association} association
   * @return {ORM/Association}
   * @public
   */
  inverseFor(association) {
    let associations = this._schema.associationsFor(this.modelName);
    let modelName = association.ownerModelName;

    let theInverse = _values(associations)
      .filter(candidate => candidate.modelName === modelName)
      .reduce((inverse, candidate) => {
        let candidateInverse = candidate.opts.inverse;
        let candidateIsImplicitInverse = candidateInverse === undefined;
        let candidateIsExplicitInverse = (candidateInverse === association.key);
        let candidateMatches = candidateIsImplicitInverse || candidateIsExplicitInverse;

        if (candidateMatches) {
          // Need to move this check to compile-time init
          assert(!inverse, `The ${this.modelName} model has multiple possible inverse associations for the ${association.key} association on the ${association.ownerModelName} model.`);

          inverse = candidate;
        }

        return inverse;
      }, null);

    return theInverse;
  }

  /**
   * Returns whether this model has an inverse association for the given
   * model-type-association pair.
   *
   * @method hasInverseFor
   * @param {String} modelName
   * @param {ORM/Association} association
   * @return {Boolean}
   * @public
   */
  hasInverseFor(association) {
    return !!this.inverseFor(association);
  }

  /**
   * Used to check if models match each other. If models are saved, we check model type
   * and id, since they could have other non-persisted properties that are different.
   *
   * @public
  */
  alreadyAssociatedWith(model, association) {
    let { key } = association;
    let associatedModelOrCollection = this[key];

    if (associatedModelOrCollection && model) {
      if (associatedModelOrCollection instanceof Model) {
        if (associatedModelOrCollection.isSaved() && model.isSaved()) {
          return associatedModelOrCollection.toString() === model.toString();
        } else {
          return associatedModelOrCollection === model;
        }
      } else {
        return associatedModelOrCollection.includes(model);
      }
    }
  }

  associate(model, association) {
    if (this.alreadyAssociatedWith(model, association)) {
      return;
    }

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
      let i;
      if (association.isPolymorphic) {
        let found = this[fk].find(({ type, id }) => (type === model.modelName && id === model.id));
        i = found && this[fk].indexOf(found);
      } else {
        i = this[fk].map(key => key.toString()).indexOf(model.id.toString());
      }

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
        let isModelOrCollection = (value instanceof Model || value instanceof Collection || value instanceof PolymorphicCollection);
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
      let association = Object.keys(this.hasManyAssociations)
        .map(key => this.hasManyAssociations[key])
        .filter(association => association.getForeignKey() === foreignKeyName)[0];

      let found;
      if (association.isPolymorphic) {
        found = foreignKeys.map(({ type, id }) => {
          return this._schema.db[toCollectionName(type)].find(id);
        });
        found = _compact(found);
      } else {
        found = this._schema.db[toCollectionName(association.modelName)].find(foreignKeys);
      }

      let foreignKeyLabel = association.isPolymorphic ? foreignKeys.map(fk => `${fk.type}:${fk.id}`).join(',') : foreignKeys;
      assert(found.length === foreignKeys.length, `You're instantiating a ${this.modelName} that has a ${foreignKeyName} of ${foreignKeyLabel}, but some of those records don't exist in the database.`);

    } else {
      let association = Object.keys(this.belongsToAssociations)
        .map(key => this.belongsToAssociations[key])
        .filter(association => association.getForeignKey() === foreignKeyName)[0];

      let found;
      if (association.isPolymorphic) {
        found = this._schema.db[toCollectionName(foreignKeys.type)].find(foreignKeys.id);
      } else {
        found = this._schema.db[toCollectionName(association.modelName)].find(foreignKeys);
      }

      let foreignKeyLabel = association.isPolymorphic ? `${foreignKeys.type}:${foreignKeys.id}` : foreignKeys;
      assert(found, `You're instantiating a ${this.modelName} that has a ${foreignKeyName} of ${foreignKeyLabel}, but that record doesn't exist in the database.`);
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
      this._associateWithNewInverses(association);
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

  // Disassociate currently persisted models that are no longer associated
  _disassociateFromHasManyInverses(association) {
    let { key } = association;
    let fk = association.getForeignKey();
    let tempAssociation = this._tempAssociations && this._tempAssociations[key];
    let associateIds = this.attrs[fk];

    if (tempAssociation && associateIds) {
      let models;
      if (association.isPolymorphic) {
        models = associateIds.map(({ type, id }) => {
          return this._schema[toCollectionName(type)].find(id);
        });
      } else {
        // TODO: prob should initialize hasMany fks with []
        models = this._schema[toCollectionName(association.modelName)]
          .find(associateIds || [])
          .models;
      }

      models
        .filter(associate => !tempAssociation.includes(associate)) // filter out models that will still be associated
        .forEach(associate => {
          if (associate.hasInverseFor(association)) {
            let inverse = associate.inverseFor(association);

            associate.disassociate(this, inverse);
            associate.save();
          }
        });
    }
  }

  /*
    Disassociate currently persisted models that are no longer associated.

    Example:

      post: Model.extend({
        comments: hasMany()
      }),

      comment: Model.extend({
        post: belongsTo()
      })

    Assume `this` is comment:1. When saving, if comment:1 is no longer
    associated with post:1, we need to remove comment:1 from post:1.comments.
    In this example `association` would be `comment.post`.
  */
  _disassociateFromBelongsToInverse(association) {
    let { key } = association;
    let fk = association.getForeignKey();
    let tempAssociation = this._tempAssociations && this._tempAssociations[key];
    let associateId = this.attrs[fk];

    if ((tempAssociation !== undefined) && associateId) {
      let associate;
      if (association.isPolymorphic) {
        associate = this._schema[toCollectionName(associateId.type)]
          .find(associateId.id);
      } else {
        associate = this._schema[toCollectionName(association.modelName)]
          .find(associateId);
      }

      if (associate.hasInverseFor(association)) {
        let inverse = associate.inverseFor(association);

        associate.disassociate(this, inverse);
        associate._updateInDb(associate.attrs);
      }
    }
  }

  // Find all other models that depend on me and update their foreign keys
  _disassociateFromDependents() {
    this._schema.dependentAssociationsFor(this.modelName)
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
      } else if (tempAssociate instanceof PolymorphicCollection) {
        tempAssociate.models.forEach(child => {
          child.save();
        });

        this._updateInDb({
          [fk]: tempAssociate.models.map(child => {
            return { type: child.modelName, id: child.id };
          })
        });

      } else {

        if (tempAssociate === null) {
          this._updateInDb({ [fk]: null });
        } else {
          tempAssociate.save();

          let fkValue;
          if (association.isPolymorphic) {
            fkValue = { id: tempAssociate.id, type: tempAssociate.modelName};
          } else {
            fkValue = tempAssociate.id;
          }

          this._updateInDb({ [fk]: fkValue });
        }
      }

      this.__isSavingNewChildren = false;
    }
  }

  /*
    Step 3 in saving associations.

    Example:

      // initial state
      post.author = steinbeck;

      // new state
      post.author = twain;

       1. Disassociate from old inverse (remove post from steinbeck.posts)
       2. Save new associates (if twain.isNew, save twain)
    -> 3. Associate with new inverse (add post to twain.posts)
  */
  _associateWithNewInverses(association) {
    if (!this.__isSavingNewChildren) {
      let modelOrCollection = this[association.key];

      if (modelOrCollection instanceof Model) {
        this._associateModelWithInverse(modelOrCollection, association);

      } else if (modelOrCollection instanceof Collection || modelOrCollection instanceof PolymorphicCollection) {
        modelOrCollection.models
          .forEach(model => {
            this._associateModelWithInverse(model, association);
          });
      }

      delete this._tempAssociations[association.key];
    }
  }

  _associateModelWithInverse(model, association) {
    if (model.hasInverseFor(association)) {
      let inverse = model.inverseFor(association);
      let inverseFk = inverse.getForeignKey();

      if (inverse.constructor.name === 'BelongsTo') {
        this._schema.db[toCollectionName(model.modelName)]
          .update(model.id, { [inverseFk]: this.id });

      } else {
        let ownerId = this.id;
        let inverseCollection = this._schema.db[toCollectionName(model.modelName)];
        let currentIdsForInverse = inverseCollection.find(model.id)[inverse.getForeignKey()] || [];
        let newIdsForInverse = currentIdsForInverse;

        if (newIdsForInverse.indexOf(ownerId) === -1) {
          newIdsForInverse.push(ownerId);
        }

        inverseCollection.update(model.id, { [inverseFk]: newIdsForInverse });
      }
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
    let idLabel = this.id ? `(${this.id})` : '';

    return `model:${this.modelName}${idLabel}`;
  }
}

Model.extend = extend;
Model.findBelongsToAssociation = function(associationType) {
  return this.prototype.belongsToAssociations[associationType];
};

export default Model;
