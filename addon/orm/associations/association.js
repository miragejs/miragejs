import Model from '../model';
import { dasherize } from 'ember-cli-mirage/utils/inflector';

export default class Association {

  constructor(modelName, opts) {
    if (typeof modelName === 'object') {
      // Received opts only
      this.modelName = undefined;
      this.opts = modelName;
    } else {
      // The modelName of the association. (Might not be passed in - set later
      // by schema).
      this.modelName = modelName ? dasherize(modelName) : '';
      this.opts = opts || {};
    }

    // The key pointing to the association
    this.key = '';

    // The modelName that owns this association
    this.ownerModelName = '';
  }

  /**
   * A setter for schema, since we don't have a reference at constuction time.
   *
   * @method setSchema
   * @public
  */
  setSchema(schema) {
    this.schema = schema;
  }

  /**
   * Returns this association's inverse, if it exists
   *
   * @method inverse
   * @return {Object} the inverse association
   * @public
  */
  inverse() {
    let inverse;

    if (this.opts.inverse === null) {
      inverse = null;

    } else {
      let associationsMap = this.schema.associationsFor(this.modelName);
      let explicitInverse = this.opts.inverse;
      if (explicitInverse) {
        inverse = associationsMap[explicitInverse];
      } else {
        let matches = Object.keys(associationsMap)
          .map(key => associationsMap[key])
          .filter(association => association.modelName === this.ownerModelName);

        if (matches.length === 1) {
          inverse = matches[0];
        } else {
          inverse = null;
        }
      }
    }

    return inverse;
  }

  /**
   * Returns true if the association is reflexive.
   *
   * @method isReflexive
   * @return {Boolean}
   * @public
  */
  isReflexive() {
    let isExplicitReflexive = !!(this.modelName === this.ownerModelName && this.opts.inverse);
    let isImplicitReflexive = !!(this.opts.inverse === undefined && this.ownerModelName === this.modelName);

    return isExplicitReflexive || isImplicitReflexive;
  }

  /**
   * Used to check if models match each other. If models are saved, we check model type
   * and id, since they could have other non-persisted properties that are different.
   *
   * @public
  */
  inversesAlreadyAssociated(inverse, owner) {
    let inverseKey = this.inverse().key;
    let inverseAssociation = inverse[inverseKey];

    if (inverseAssociation && owner) {
      if (inverseAssociation instanceof Model) {
        if (inverseAssociation.isSaved() && owner.isSaved()) {
          return inverseAssociation.toString() === owner.toString();
        } else {
          return inverseAssociation === owner;
        }
      } else {
        return inverseAssociation.includes(owner);
      }
    }
  }
}
