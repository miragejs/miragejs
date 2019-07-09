import { dasherize } from "../../utils/inflector";

/**
  Associations are used to define relationships between your Models.

  @class Association
  @constructor
  @public
*/
export default class Association {
  constructor(modelName, opts) {
    if (typeof modelName === "object") {
      // Received opts only
      this.modelName = undefined;
      this.opts = modelName;
    } else {
      // The modelName of the association. (Might not be passed in - set later
      // by schema).
      this.modelName = modelName ? dasherize(modelName) : "";
      this.opts = opts || {};
    }

    // The key pointing to the association
    this.key = "";

    // The modelName that owns this association
    this.ownerModelName = "";
  }

  /**
     A setter for schema, since we don't have a reference at constuction time.

     @method setSchema
     @public
     @hide
  */
  setSchema(schema) {
    this.schema = schema;
  }

  /**
     Returns true if the association is reflexive.

     @method isReflexive
     @return {Boolean}
     @public
  */
  isReflexive() {
    let isExplicitReflexive = !!(
      this.modelName === this.ownerModelName && this.opts.inverse
    );
    let isImplicitReflexive = !!(
      this.opts.inverse === undefined && this.ownerModelName === this.modelName
    );

    return isExplicitReflexive || isImplicitReflexive;
  }

  get isPolymorphic() {
    return this.opts.polymorphic;
  }

  /**
    @hide
  */
  get identifier() {
    throw new Error(
      "Subclasses of Association must implement a getter for identifier"
    );
  }
}
