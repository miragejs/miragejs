// jscs:disable requireParenthesesAroundArrowParam
import { pluralize, camelize } from '../utils/inflector';
import extend from '../utils/extend';
import assert from '../assert';
import Collection from './collection';

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
    let collection = pluralize(camelize(this.modelName));

    if (this.isNew()) {
      // Update the attrs with the db response
      this.attrs = this._schema.db[collection].insert(this.attrs);

      // Ensure the id getter/setter is set
      this._definePlainAttribute('id');

    } else {
      this._schema.db[collection].update(this.attrs.id, this.attrs);
    }

    // Update associated children
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
    let collection = pluralize(camelize(this.modelName));
    this._schema.db[collection].remove(this.attrs.id);
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
      let collectionName = pluralize(camelize(this.modelName));
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
    let collection = pluralize(camelize(this.modelName));
    let attrs = this._schema.db[collection].find(this.id);

    Object.keys(attrs)
      .filter(function(attr) {
        return attr !== 'id';
      })
      .forEach(function(attr) {
        this[attr] = attrs[attr];
      }, this);

    return this;
  }

  toJSON() {
    return this.attrs;
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
      .filter(key => {
        let value = attrs[key];
        return (value instanceof Model || value instanceof Collection);
      })
      .forEach(key => {
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
      hash[fk] = attrs[fk] || null;
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
    if (this[attr] !== undefined) {
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
        this.attrs[attr] = val; return this;
      }
    });
  }

  /**
   * @method _setupRelationships
   * @param attrs
   * @private
   */
  _setupRelationships(attrs) {
    // Only want association keys and fks
    let hash = Object.keys(attrs).reduce((memo, attr) => {
      if (this.associationKeys.indexOf(attr) > -1 || this.associationIdKeys.indexOf(attr) > -1 || this.fks.indexOf(attr) > -1) {
        memo[attr] = attrs[attr];
      }
      return memo;
    }, {});

    Object.keys(hash).forEach(function(attr) {
      this[attr] = hash[attr];
    }, this);
  }

  /**
   * Update associated children when saving a collection
   * @method _saveAssociations
   * @private
   */
  _saveAssociations() {
    Object.keys(this.belongsToAssociations).forEach(key => {
      let association = this.belongsToAssociations[key];
      let parent = this[key];
      if (parent && parent.isNew()) {
        let fk = association.getForeignKey();
        parent.save();
        this.update(fk, parent.id);
      }
    });

    Object.keys(this.hasManyAssociations).forEach(key => {
      let association = this.hasManyAssociations[key];
      let children = this[key];
      children.update(association.getForeignKey(), this.id);
    });
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

export default Model;
