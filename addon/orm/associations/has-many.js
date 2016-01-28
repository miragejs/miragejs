import Association from './association';
import Collection from '../collection';
import _assign from 'lodash/object/assign';
import _compact from 'lodash/array/compact';
import { capitalize, camelize } from 'ember-cli-mirage/utils/inflector';
import assert from 'ember-cli-mirage/assert';

class HasMany extends Association {

  /*
    The hasMany association adds a fk to the target of the association
  */
  getForeignKeyArray() {
    return [camelize(this.target), `${camelize(this.owner)}Id`];
  }

  getForeignKey() {
    return `${camelize(this.owner)}Id`;
  }

  addMethodsToModelClass(ModelClass, key, schema) {
    let modelPrototype = ModelClass.prototype;
    this._model = modelPrototype;
    this._key = key;

    var association = this;
    var foreignKey = this.getForeignKey();
    var relationshipIdsKey = camelize(association.target) + 'Ids';

    var associationHash = {[key]: this};
    modelPrototype.hasManyAssociations = _assign(modelPrototype.hasManyAssociations, associationHash);
    modelPrototype.associationKeys.push(key);
    modelPrototype.associationIdKeys.push(relationshipIdsKey);

    Object.defineProperty(modelPrototype, relationshipIdsKey, {

      /*
        object.childrenIds
          - returns an array of the associated children's ids
      */
      get: function() {
        var models = association._cachedChildren || [];

        if (!this.isNew()) {
          var query = {[foreignKey]: this.id};
          var savedModels = schema[camelize(association.target)].where(query);

          models = savedModels.mergeCollection(models);
        }

        return models.map(model => model.id);
      },

      /*
        object.childrenIds = ([childrenIds...])
          - sets the associated parent (via id)
      */
      set: function(ids) {
        ids = ids || [];

        if (this.isNew()) {
          association._cachedChildren = schema[camelize(association.target)].find(ids);

        } else {
          // Set current children's fk to null
          var query = {[foreignKey]: this.id};
          schema[camelize(association.target)].where(query).update(foreignKey, null);

          // Associate the new childrens to this model
          schema[camelize(association.target)].find(ids).update(foreignKey, this.id);

          // Clear out any old cached children
          association._cachedChildren = [];
        }

        return this;
      }
    });

    Object.defineProperty(modelPrototype, key, {

      /*
        object.children
          - returns an array of associated children
      */
      get: function() {
        var tempModels = association._cachedChildren || [];

        if (this.isNew()) {
          return tempModels;

        } else {
          var query = {};
          query[foreignKey] = this.id;
          var savedModels = schema[camelize(association.target)].where(query);

          return savedModels.mergeCollection(tempModels);
        }
      },

      /*
        object.children = [model1, model2, ...]
          - sets the associated children (via array of models)
          - note: this method will persist unsaved chidren
            + (why? because rails does)
      */
      set: function(models) {
        models = models ? _compact(models) : [];

        if (this.isNew()) {
          association._cachedChildren = models instanceof Collection ? models : new Collection(association.target, models);

        } else {

          // Set current children's fk to null
          var query = {[foreignKey]: this.id};
          schema[camelize(association.target)].where(query).update(foreignKey, null);

          // Save any children that are new
          models.filter(model => model.isNew())
            .forEach(model => model.save());

          // Associate the new children to this model
          schema[camelize(association.target)].find(models.map(m => m.id)).update(foreignKey, this.id);

          // Clear out any old cached children
          association._cachedChildren = [];
        }
      }
    });

    /*
      object.newChild
        - creates a new unsaved associated child
    */
    modelPrototype['new' + capitalize(camelize(association.target))] = function(attrs = {}) {
      if (!this.isNew()) {
        attrs = _assign(attrs, { [foreignKey]: this.id });
      }

      var child = schema[camelize(association.target)].new(attrs);

      association._cachedChildren = association._cachedChildren || new Collection(association.target);
      association._cachedChildren.push(child);

      return child;
    };

    /*
      object.createChild
        - creates an associated child, persists directly to db, and
          updates the target's foreign key
        - parent must be saved
    */
    modelPrototype['create' + capitalize(camelize(association.target))] = function(attrs = {}) {
      assert(!this.isNew(), 'You cannot call create unless the parent is saved');

      var augmentedAttrs = _assign(attrs, { [foreignKey]: this.id });
      var child = schema[camelize(association.target)].create(augmentedAttrs);

      return child;
    };
  }
}

export default HasMany;
