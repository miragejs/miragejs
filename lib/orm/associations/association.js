import { dasherize } from "../../utils/inflector";

/**
  Associations represent relationships between your Models.

  The `hasMany` and `belongsTo` helpers are how you actually define relationships:
  
  ```js
  import { Server, Model, hasMany, belongsTo }

  new Server({
    models: {
      user: Model.extend({
        comments: hasMany()
      }),
      comments: Model.extend({
        user: belongsTo()
      })
    }
  })
  ```

  View [the Relationships](https://miragejs.com/docs/main-concepts/relationships/) guide to learn more about setting up relationships.

  Each usage of the helper registers an Association (either a `HasManyAssociation` or `BelongsToAssociation`) with your server's `Schema`. You can access these associations using either the `schema.associationsFor` method, or the `associations` accessor on individual model instances.

  You can then introspect the associations to do things like dynamically build up your JSON response in your serializers.

  @class Association
  @constructor
  @public
*/
export default class Association {
  constructor(modelName, opts) {
    /**
      The modelName of the associated model.

      For example, given this configuration
      
      ```js
      new Server({
        user: Model,
        comment: Model.extend({
          author: belongsTo('user')
        })
      })
      ```

      the association's `modelname` would be `user`.

      Note that just like in this example, the `modelName` and the `key` can be different. This is because Mirage supports multiple relationships of the same type:

      ```js
      new Server({
        user: Model,
        comment: Model.extend({
          author: belongsTo('user'),
          reviewer: belongsTo('user')
        })
      })
      ```

      For both these relationships, the `modelName` is `user`, but the first association has a `key` of `author` while the second has a `key` of `reviewer`.

      @property modelName
      @type {String}
      @public
    */
    this.modelName = undefined; // hack to add ESDOC info. Any better way?

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

    /**
      The object key used to define the association.

      For example, given this configuration
      
      ```js
      new Server({
        user: Model,
        comment: Model.extend({
          author: belongsTo('user')
        })
      })
      ```

      the association's `key` would be `author`.
      
      The key is used by Mirage to define foreign keys on the model (`comment.authorId` in this case), among other things.

      @property key
      @type {String}
      @public
    */
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
     Returns a Boolean that's true if the association is self-referential, i.e. if a model has an association with itself.

     For example, given

     ```js
     new Server({
       models: {
         user: Model.extend({
           friends: hasMany('user')
         })
       }
     })
     ```

     then

     ```js
     server.schema.associationsFor('user').friends.isReflexive // true
     ```

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

  /**
     Returns a Boolean that's true if the association is polymorphic:

     For example, given

     ```js
     new Server({
       models: {
         comment: Model.extend({
           commentable: belongsTo({ polymorphic: true })
         })
       }
     })
     ```

     then

     ```js
     server.schema.associationsFor('comment').commentable.isPolymorphic // true
     ```

     Check out [the guides on polymorphic associations](https://miragejs.com/docs/main-concepts/relationships/#polymorphic) to learn more.

     @accessor isPolymorphic
     @return {Boolean}
     @public
  */
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
