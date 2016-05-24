import Association from './association';
import _assign from 'lodash/object/assign';
import { capitalize, camelize, pluralize } from 'ember-cli-mirage/utils/inflector';
import assert from 'ember-cli-mirage/assert';

class BelongsTo extends Association {

  /*
    The belongsTo association adds a fk to the owner of the association
  */
  getForeignKeyArray() {
    return [camelize(this.ownerModelName), `${camelize(this.key)}Id`];
  }

  getForeignKey() {
    return `${camelize(this.key)}Id`;
  }

  addMethodsToModelClass(ModelClass, key, schema) {
    let modelPrototype = ModelClass.prototype;
    let association = this;
    let foreignKey = this.getForeignKey();

    let associationHash = {};
    associationHash[key] = this;
    modelPrototype.belongsToAssociations = _assign(modelPrototype.belongsToAssociations, associationHash);
    modelPrototype.associationKeys.push(key);
    modelPrototype.associationIdKeys.push(foreignKey);

    Object.defineProperty(modelPrototype, this.getForeignKey(), {

      /*
        object.parentId
          - returns the associated parent's id
      */
      get() {
        return this.attrs[foreignKey];
      },

      /*
        object.parentId = (parentId)
          - sets the associated parent (via id)
      */
      set(id) {
        assert(
          !id || schema.db[pluralize(camelize(association.modelName))].find(id),
          `Couldn\'t find ${association.modelName} with id = ${id}`
        );

        this.attrs[foreignKey] = id;
        return this;
      }
    });

    Object.defineProperty(modelPrototype, key, {
      /*
        object.parent
          - returns the associated parent
      */
      get() {
        let foreignKeyId = this[foreignKey];
        if (foreignKeyId != null) {
          association._tempParent = null;
          return schema[pluralize(camelize(association.modelName))].find(foreignKeyId);

        } else if (association._tempParent) {
          return association._tempParent;
        } else {
          return null;
        }
      },

      /*
        object.parent = (parentModel)
          - sets the associated parent (via model)
      */
      set(newModel) {
        if (newModel && newModel.isNew()) {
          this[foreignKey] = null;
          association._tempParent = newModel;
        } else if (newModel) {
          association._tempParent = null;
          this[foreignKey] = newModel.id;
        } else {
          association._tempParent = null;
          this[foreignKey] = null;
        }
      }
    });

    /*
      object.newParent
        - creates a new unsaved associated parent
    */
    modelPrototype[`new${capitalize(key)}`] = function(attrs) {
      let parent = schema[pluralize(camelize(association.modelName))].new(attrs);

      this[key] = parent;

      return parent;
    };

    /*
      object.createParent
        - creates an associated parent, persists directly to db,
          and updates the owner's foreign key
    */
    modelPrototype[`create${capitalize(key)}`] = function(attrs) {
      let parent = schema[pluralize(camelize(association.modelName))].create(attrs);

      this[foreignKey] = parent.id;

      return parent;
    };
  }

}

export default BelongsTo;
