import Association from './association';
import _assign from 'lodash/assign';
import { capitalize, camelize } from 'ember-cli-mirage/utils/inflector';
import { toCollectionName } from 'ember-cli-mirage/utils/normalize-name';
import assert from 'ember-cli-mirage/assert';

/**
 * The belongsTo association adds a fk to the owner of the association
 *
 * @class BelongsTo
 * @extends Association
 * @constructor
 * @public
 */
export default class BelongsTo extends Association {

  /**
   * @method getForeignKeyArray
   * @return {Array} Array of camelized name of the model owning the association
   * and foreign key for the association
   * @public
   */
  getForeignKeyArray() {
    return [camelize(this.ownerModelName), this.getForeignKey()];
  }

  /**
   * @method getForeignKey
   * @return {String} Foreign key for the association
   * @public
   */
  getForeignKey() {
    return `${camelize(this.key)}Id`;
  }

  /**
   * registers belongs-to association defined by given key on given model,
   * defines getters / setters for associated parent and associated parent's id,
   * adds methods for creating unsaved parent record and creating a saved one
   *
   * @method addMethodsToModelClass
   * @param {Function} ModelClass
   * @param {String} key the named key for the association
   * @public
   */
  addMethodsToModelClass(ModelClass, key) {
    let modelPrototype = ModelClass.prototype;
    let association = this;
    let foreignKey = this.getForeignKey();
    let associationHash = { [key]: this };

    modelPrototype.belongsToAssociations = _assign(modelPrototype.belongsToAssociations, associationHash);

    // Add to target's dependent associations array
    this.schema.addDependentAssociation(this, this.modelName);

    // TODO: look how this is used. Are these necessary, seems like they could be gotten from the above?
    // Or we could use a single data structure to store this information?
    modelPrototype.associationKeys.push(key);
    modelPrototype.associationIdKeys.push(foreignKey);

    Object.defineProperty(modelPrototype, foreignKey, {

      /*
        object.parentId
          - returns the associated parent's id
      */
      get() {
        this._tempAssociations = this._tempAssociations || {};
        let tempParent = this._tempAssociations[key];
        let id;

        if (tempParent === null) {
          id = null;
        } else if (tempParent) {
          id = tempParent.id;
        } else {
          id = this.attrs[foreignKey];
        }

        return id;
      },

      /*
        object.parentId = (parentId)
          - sets the associated parent via id
      */
      set(id) {
        let tempParent;

        if (id === null) {
          tempParent = null;
        } else if (id !== undefined) {
          tempParent = association.schema[toCollectionName(association.modelName)].find(id);
          assert(tempParent, `Couldn\'t find ${association.modelName} with id = ${id}`);
        }

        this[key] = tempParent;
      }
    });

    Object.defineProperty(modelPrototype, key, {
      /*
        object.parent
          - returns the associated parent
      */
      get() {
        this._tempAssociations = this._tempAssociations || {};

        let tempParent = this._tempAssociations[key];
        let foreignKeyId = this[foreignKey];
        let model = null;

        if (tempParent) {
          model = tempParent;
        } else if (foreignKeyId !== null) {
          model = association.schema[toCollectionName(association.modelName)].find(foreignKeyId);
        }

        return model;
      },

      /*
        object.parent = (parentModel)
          - sets the associated parent via model
      */
      set(model) {
        this._tempAssociations = this._tempAssociations || {};
        this._tempAssociations[key] = model;

        if (
          model
          && association.inverse()
          && !association.inversesAlreadyAssociated(model, this) // check for an existing match, to avoid recursion
        )  {
          model.associate(this, association.inverse());
        }
      }
    });

    /*
      object.newParent
        - creates a new unsaved associated parent
    */
    modelPrototype[`new${capitalize(key)}`] = function(attrs) {
      let parent = association.schema[toCollectionName(association.modelName)].new(attrs);

      this[key] = parent;

      return parent;
    };

    /*
      object.createParent
        - creates a new saved associated parent, and immediately persists both models
    */
    modelPrototype[`create${capitalize(key)}`] = function(attrs) {
      let parent = association.schema[toCollectionName(association.modelName)].create(attrs);

      this[key] = parent;
      this.save();

      return parent;
    };
  }

  /**
   *
   *
   * @public
  */
  disassociateAllDependentsFromTarget(model) {
    let owner = this.ownerModelName;
    let dependents = this.schema[toCollectionName(owner)]
      .where({ [this.getForeignKey()]: model.id });

    dependents.models.forEach(dependent => {
      dependent.disassociate(model, this);
      dependent.save();
    });
  }
}
