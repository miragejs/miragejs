import { pluralize, camelize } from '../utils/inflector';
import extend from '../utils/extend';

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
    if (!schema) { throw 'Mirage: A model requires a schema'; }
    if (!modelName) { throw 'Mirage: A model requires a modelName'; }

    this._schema = schema;
    this.modelName = modelName;
    this.fks = fks || [];
    attrs = attrs || {};

    this._setupAttrs(attrs);
    this._setupRelationships(attrs);

    return this;
  }

  /*
    Create or save the model
  */
  save() {
    var collection = pluralize(camelize(this.modelName));

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

  /*
    Update the db record
  */
  update(key, val) {
    var _this = this;
    var attrs;
    if (key == null) {return this;}

    if (typeof key === 'object') {
      attrs = key;
    } else {
      (attrs = {})[key] = val;
    }

    Object.keys(attrs).forEach(function(attr) {
      _this[attr] = attrs[attr];
    });

    this.save();

    return this;
  }

  /*
    Destroy the db record
  */
  destroy() {
    var collection = pluralize(camelize(this.modelName));
    this._schema.db[collection].remove(this.attrs.id);
  }

  isNew() {
    return this.attrs.id === undefined || this.attrs.id === null;
  }

  isSaved() {
    return this.attrs.id !== undefined && this.attrs.id !== null;
  }

  /*
    Reload data from the db
  */
  reload() {
    var _this = this;
    var collection = pluralize(camelize(this.modelName));
    var attrs = this._schema.db[collection].find(this.id);

    Object.keys(attrs)
      .filter(function(attr) { return attr !== 'id'; })
      .forEach(function(attr) {
        _this[attr] = attrs[attr];
      });

    return this;
  }


  // Private
  /*
    model.attrs represents the persistable attributes, i.e. your db
    table fields.
  */
  _setupAttrs(attrs) {
    var _this = this;

    // Filter out association keys
    var hash = Object.keys(attrs).reduce(function(memo, attr) {
      if (_this.associationKeys.indexOf(attr) === -1 && _this.associationIdKeys.indexOf(attr) === -1) {
        memo[attr] = attrs[attr];
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
      if (_this.associationKeys.indexOf(attr) === -1 && _this.associationIdKeys.indexOf(attr) === -1) {
        _this._definePlainAttribute(attr);
      }
    });
  }

  /*
    Define getter/setter for a plain attribute
  */
  _definePlainAttribute(attr) {
    if (this[attr] !== undefined) { return; }

    // Ensure the attribute is on the attrs hash
    if (!this.attrs.hasOwnProperty(attr)) {
      this.attrs[attr] = null;
    }

    // Define the getter/setter
    Object.defineProperty(this, attr, {
      get: function () { return this.attrs[attr]; },
      set: function (val) { this.attrs[attr] = val; return this; },
    });
  }

  _setupRelationships(attrs) {
    var _this = this;

    // Only want association keys and fks
    var hash = Object.keys(attrs).reduce(function(memo, attr) {
      if (_this.associationKeys.indexOf(attr) > -1 || _this.associationIdKeys.indexOf(attr) > -1 || _this.fks.indexOf(attr) > -1) {
        memo[attr] = attrs[attr];
      }

      return memo;
    }, {});

    Object.keys(hash).forEach(function(attr) {
      _this[attr] = hash[attr];
    });
  }

  _saveAssociations() {
    Object.keys(this.belongsToAssociations).forEach(key => {
      var association = this.belongsToAssociations[key];
      var parent = this[key];
      if (parent && parent.isNew()) {
        var fk = association.getForeignKey();
        parent.save();
        this.update(fk, parent.id);
      }
    });

    Object.keys(this.hasManyAssociations).forEach(key => {
      var association = this.hasManyAssociations[key];
      var children = this[key];
      children.update(association.getForeignKey(), this.id);
    });
  }

  toString() {
    return `model:${this.modelName}(${this.id})`;
  }
}

Model.extend = extend;

export default Model;
