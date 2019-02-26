import BelongsTo from './associations/belongs-to';
import HasMany from './associations/has-many';
import { toCollectionName, toInternalCollectionName } from 'ember-cli-mirage/utils/normalize-name';
import extend from '../utils/extend';
import assert from '../assert';
import Collection from './collection';
import PolymorphicCollection from './polymorphic-collection';
import _values from 'lodash/values';
import _compact from 'lodash/compact';
import _assign from 'lodash/assign';

/**
  Models wrap your database and allow you to define relationships.

  As a clarifying point, Mirage model instances only exist within Mirage's server, and are not shared directly with your Ember app. The only way to get Mirage models into your Ember app is via an API call. This means you should never create a Mirage model and, for example, pass it directly into an Ember component. They exist solely to help you manage the data and relationships in your fake backend.

  If you're using Ember Data and version 0.3.3. of Mirage or later, your Mirage model definitions (with relationships) will be detected and auto-generated for you, so you don't need to define the files yourself. If you're not, you can define models by adding files under `/models` or using the provided generator:

  ```
  ember g mirage-model blog-post
  ```

  This would create the following file:

  ```js
  // mirage/models/blog-post.js
  import { Model } from 'ember-cli-mirage';

  export default Model;
  ```

  **Class vs. instance methods**

  The methods documented below apply to _instances_ of models, but you'll typically use the `Schema` to access the model _class_, which can be used to find or create instances.

  You can find the Class methods documented under the `Schema` API docs.

  **Accessing properties and relationships**

  You can access properites (fields) and relationships directly off of models.

  ```js
  user.name;    // 'Sam'
  user.team;    // Team model
  user.teamId;  // Team id (foreign key)
  ```

  Mirage Models are schemaless in their attributes, but their relationship schema is known.

  For example,

  ```js
  let user = schema.users.create();
  user.attrs  // { }
  user.name   // undefined

  let user = schema.users.create({ name: 'Sam' });
  user.attrs  // { name: 'Sam' }
  user.name   // 'Sam'
  ```

  However, if a `user` has a `posts` relationships defined,

  ```js
  let user = schema.users.create();
  user.posts  // returns an empty Posts Collection
  ```

  @class Model
  @constructor
  @public
 */
class Model {

  // TODO: schema and modelName now set statically at registration, need to remove
  /*
    Notes:

  - We need to pass in modelName, because models are created with
    .extend and anonymous functions, so you cannot use
    reflection to find the name of the constructor.
  */
  constructor(schema, modelName, attrs, fks) {
    assert(schema, 'A model requires a schema');
    assert(modelName, 'A model requires a modelName');

    this._schema = schema;
    this.modelName = modelName;
    this.fks = fks || [];

    /**
      Returns the attributes of your model.

      ```js
      let post = schema.blogPosts.find(1);
      post.attrs; // {id: 1, title: 'Lorem Ipsum', publishedAt: '2012-01-01 10:00:00'}
      ```

      Note that you can also access individual attributes directly off a model, e.g. `post.title`.

      @property attrs
      @public
    */
    this.attrs = undefined;

    attrs = attrs || {};

    this._setupAttrs(attrs);
    this._setupRelationships(attrs);

    return this;
  }

  /**
    Create or saves the model.

    ```js
    let post = blogPosts.new({ title: 'Lorem ipsum' });
    post.id; // null

    post.save();
    post.id; // 1

    post.title = 'Hipster ipsum'; // db has not been updated
    post.save();                  // ...now the db is updated
    ```

    @method save
    @return this
    @public
   */
  save() {
    let collection = toInternalCollectionName(this.modelName);

    if (this.isNew()) {
      // Update the attrs with the db response
      this.attrs = this._schema.db[collection].insert(this.attrs);

      // Ensure the id getter/setter is set
      this._definePlainAttribute('id');

    } else {
      this._schema.isSaving[this.toString()] = true;
      this._schema.db[collection].update(this.attrs.id, this.attrs);
    }

    this._saveAssociations();

    this._schema.isSaving[this.toString()] = false;
    return this;
  }

  /**
    Updates the record in the db.

    ```js
    let post = blogPosts.find(1);
    post.update('title', 'Hipster ipsum'); // the db was updated
    post.update({
      title: 'Lorem ipsum',
      created_at: 'before it was cool'
    });
    ```

    @method update
    @param {String} key
    @param {String} val
    @return this
    @public
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
      if (this.associationKeys.indexOf(attr) === -1 && this.associationIdKeys.indexOf(attr) === -1) {
        this._definePlainAttribute(attr);
      }
      this[attr] = attrs[attr];
    }, this);

    this.save();

    return this;
  }

  /**
    Destroys the db record.

    ```js
    let post = blogPosts.find(1);
    post.destroy(); // removed from the db
    ```

    @method destroy
    @public
   */
  destroy() {
    if (this.isSaved()) {
      this._disassociateFromDependents();

      let collection = toInternalCollectionName(this.modelName);
      this._schema.db[collection].remove(this.attrs.id);
    }
  }

  /**
    Boolean, true if the model has not been persisted yet to the db.

    ```js
    let post = blogPosts.new({title: 'Lorem ipsum'});
    post.isNew(); // true
    post.id;      // null

    post.save();  // true
    post.isNew(); // false
    post.id;      // 1
    ```

    @method isNew
    @return {Boolean}
    @public
   */
  isNew() {
    let hasDbRecord = false;
    let hasId = this.attrs.id !== undefined && this.attrs.id !== null;

    if (hasId) {
      let collectionName = toInternalCollectionName(this.modelName);
      let record = this._schema.db[collectionName].find(this.attrs.id);

      if (record) {
        hasDbRecord = true;
      }
    }

    return !hasDbRecord;
  }

  /**
    Boolean, opposite of `isNew`

    @method isSaved
    @return {Boolean}
    @public
   */
  isSaved() {
    return !this.isNew();
  }

  /**
    Reload a model's data from the database.

    ```js
    let post = blogPosts.find(1);
    post.attrs;     // {id: 1, title: 'Lorem ipsum'}

    post.title = 'Hipster ipsum';
    post.title;     // 'Hipster ipsum';

    post.reload();  // true
    post.title;     // 'Lorem ipsum'
    ```

    @method reload
    @return this
    @public
   */
  reload() {
    if (this.id) {
      let collection = toInternalCollectionName(this.modelName);
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
    Returns the association for the given key

    @method associationFor
    @param key
    @public
    @hide
   */
  associationFor(key) {
    return this._schema.associationsFor(this.modelName)[key];
  }

  /**
    Returns this model's inverse association for the given
    model-type-association pair, if it exists.

    Example:

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

    @method hasInverseFor
    @param {String} modelName The model name of the class we're scanning
    @param {ORM/Association} association
    @return {ORM/Association}
    @public
    @hide
   */
  inverseFor(association) {
    return this._explicitInverseFor(association) || this._implicitInverseFor(association);
  }

  /**
    Finds the inverse for an association that explicity defines it's inverse

    @private
    @hide
  */
  _explicitInverseFor(association) {
    this._checkForMultipleExplicitInverses(association);

    let associations = this._schema.associationsFor(this.modelName);
    let inverse = association.opts.inverse;
    let candidate = inverse ? associations[inverse] : null;
    let matchingPolymorphic = candidate && candidate.isPolymorphic;
    let matchingInverse = candidate && candidate.modelName === association.ownerModelName;
    let candidateInverse = candidate && candidate.opts.inverse;

    if (candidateInverse && candidate.opts.inverse !== association.key) {
      assert(
        false,
        `You specified an inverse of ${inverse} for ${association.key}, but it does not match ${candidate.modelName} ${candidate.key}'s inverse`
      );
    }

    return matchingPolymorphic || matchingInverse ? candidate : null;
  }

  /**
    Ensures multiple explicit inverses don't exist on the current model
    for the given association.

    TODO: move this to compile-time check

    @private
    @hide
  */
  _checkForMultipleExplicitInverses(association) {
    let associations = this._schema.associationsFor(this.modelName);
    let matchingExplicitInverses = Object.keys(associations).filter(key => {
      let candidate = associations[key];
      let modelMatches = association.ownerModelName === candidate.modelName;
      let inverseKeyMatches = association.key === candidate.opts.inverse;

      return modelMatches && inverseKeyMatches;
    });
    assert(
      matchingExplicitInverses.length <= 1,
      `The ${this.modelName} model has defined multiple explicit inverse associations for the ${association.ownerModelName}.${association.key} association.`
    );
  }

  /**
    Finds if there is an inverse for an association that does not
    explicitly define one.

    @private
    @hide
  */
  _implicitInverseFor(association) {
    let associations = this._schema.associationsFor(this.modelName);
    let modelName = association.ownerModelName;

    return _values(associations)
      .filter(candidate => candidate.modelName === modelName)
      .reduce((inverse, candidate) => {
        let candidateInverse = candidate.opts.inverse;
        let candidateIsImplicitInverse = candidateInverse === undefined;
        let candidateIsExplicitInverse = candidateInverse === association.key;

        let candidateMatches = candidateIsImplicitInverse || candidateIsExplicitInverse;

        if (candidateMatches) {
          // Need to move this check to compile-time init
          assert(!inverse, `The ${this.modelName} model has multiple possible inverse associations for the ${association.ownerModelName}.${association.key} association.`);
          inverse = candidate;
        }

        return inverse;
      }, null);
  }

  /**
    Returns whether this model has an inverse association for the given
    model-type-association pair.

    @method hasInverseFor
    @param {String} modelName
    @param {ORM/Association} association
    @return {Boolean}
    @public
    @hide
   */
  hasInverseFor(association) {
    return !!this.inverseFor(association);
  }

  /**
    Used to check if models match each other. If models are saved, we check model type
    and id, since they could have other non-persisted properties that are different.

    @public
    @hide
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

    if (association instanceof HasMany) {
      if (!this[key].includes(model)) {
        this[key].add(model);
      }
    } else {
      this[key] = model;
    }
  }

  disassociate(model, association) {
    let fk = association.getForeignKey();

    if (association instanceof HasMany) {
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

  /**
    @hide
  */
  get isSaving() {
    return this._schema.isSaving[this.toString()];
  }

  // Private
  /**
    model.attrs represents the persistable attributes, i.e. your db
    table fields.
    @method _setupAttrs
    @param attrs
    @private
    @hide
   */
  _setupAttrs(attrs) {
    this._validateAttrs(attrs);

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
    Define getter/setter for a plain attribute
    @method _definePlainAttribute
    @param attr
    @private
    @hide
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
    Foreign keys get set on attrs directly (to avoid potential recursion), but
    model references use the setter.
   *
    We validate foreign keys during instantiation.
   *
    @method _setupRelationships
    @param attrs
    @private
    @hide
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
    @method _validateAttrs
    @private
    @hide
   */
  _validateAttrs(attrs) {
    // Verify attrs passed in for associations are actually associations
    Object.keys(attrs)
      .filter(key => this.associationKeys.includes(key))
      .forEach(key => {
        let value = attrs[key];
        let association = this.associationFor(key);
        let isNull = value === null;

        if (association instanceof HasMany) {
          let isCollection = value instanceof Collection || value instanceof PolymorphicCollection;
          let isArrayOfModels = Array.isArray(value) && value.every(item => item instanceof Model);

          assert(isCollection || isArrayOfModels || isNull, `You're trying to create a ${this.modelName} model and you passed in "${value}" under the ${key} key, but that key is a HasMany relationship. You must pass in a Collection, PolymorphicCollection, array of Models, or null.`);

        } else if (association instanceof BelongsTo) {
          assert(value instanceof Model || isNull, `You're trying to create a ${this.modelName} model and you passed in "${value}" under the ${key} key, but that key is a BelongsTo relationship. You must pass in a Model or null.`);
        }
      });

    // Verify attrs passed in for association foreign keys are actually fks
    Object.keys(attrs)
      .filter(key => this.associationIdKeys.includes(key))
      .forEach(key => {
        let value = attrs[key];

        if (key.match(/Ids$/)) {
          let isArray = Array.isArray(value);
          let isNull = value === null;
          assert(isArray || isNull, `You're trying to create a ${this.modelName} model and you passed in "${value}" under the ${key} key, but that key is a foreign key for a HasMany relationship. You must pass in an array of ids or null.`);
        }
      });

    // Verify no undefined associations are passed in
    Object.keys(attrs)
      .filter(key => {
        let value = attrs[key];
        let isModelOrCollection = (value instanceof Model || value instanceof Collection || value instanceof PolymorphicCollection);
        let isArrayOfModels = Array.isArray(value) && value.length && value.every(item => item instanceof Model);

        return isModelOrCollection || isArrayOfModels;
      })
      .forEach(key => {
        let modelOrCollection = attrs[key];

        assert(this.associationKeys.indexOf(key) > -1, `You're trying to create a ${this.modelName} model and you passed in a ${modelOrCollection.toString()} under the ${key} key, but you haven't defined that key as an association on your model.`);
      });
  }

  /**
    Originally we validated this via association.setId method, but it triggered
    recursion. That method is designed for updating an existing model's ID so
    this method is needed during instantiation.
   *
    @method _validateForeignKeyExistsInDatabase
    @private
    @hide
   */
  _validateForeignKeyExistsInDatabase(foreignKeyName, foreignKeys) {
    if (Array.isArray(foreignKeys)) {
      let association = Object.keys(this.hasManyAssociations)
        .map(key => this.hasManyAssociations[key])
        .filter(association => association.getForeignKey() === foreignKeyName)[0];

      let found;
      if (association.isPolymorphic) {
        found = foreignKeys.map(({ type, id }) => {
          return this._schema.db[toInternalCollectionName(type)].find(id);
        });
        found = _compact(found);
      } else {
        found = this._schema.db[toInternalCollectionName(association.modelName)].find(foreignKeys);
      }

      let foreignKeyLabel = association.isPolymorphic ? foreignKeys.map(fk => `${fk.type}:${fk.id}`).join(',') : foreignKeys;
      assert(found.length === foreignKeys.length, `You're instantiating a ${this.modelName} that has a ${foreignKeyName} of ${foreignKeyLabel}, but some of those records don't exist in the database.`);

    } else {
      let association = Object.keys(this.belongsToAssociations)
        .map(key => this.belongsToAssociations[key])
        .filter(association => association.getForeignKey() === foreignKeyName)[0];

      let found;
      if (association.isPolymorphic) {
        found = this._schema.db[toInternalCollectionName(foreignKeys.type)].find(foreignKeys.id);
      } else {
        found = this._schema.db[toInternalCollectionName(association.modelName)].find(foreignKeys);
      }

      let foreignKeyLabel = association.isPolymorphic ? `${foreignKeys.type}:${foreignKeys.id}` : foreignKeys;
      assert(found, `You're instantiating a ${this.modelName} that has a ${foreignKeyName} of ${foreignKeyLabel}, but that record doesn't exist in the database.`);
    }
  }

  /**
    Update associated children when saving a collection
   *
    @method _saveAssociations
    @private
    @hide
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
    if (association instanceof HasMany) {
      this._disassociateFromHasManyInverses(association);
    } else if (association instanceof BelongsTo) {
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
        .filter(associate => !associate.isSaving) // filter out models that are already being saved
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
        tempAssociate.models
          .filter(model => !model.isSaving)
          .forEach(child => {
            child.save();
          });

        this._updateInDb({ [fk]: tempAssociate.models.map(child => child.id) });

      } else if (tempAssociate instanceof PolymorphicCollection) {
        tempAssociate.models
          .filter(model => !model.isSaving)
          .forEach(child => {
            child.save();
          });

        this._updateInDb({
          [fk]: tempAssociate.models.map(child => {
            return { type: child.modelName, id: child.id };
          })
        });

      } else {

        // Clearing the association
        if (tempAssociate === null) {
          this._updateInDb({ [fk]: null });

        // Self-referential
        } else if (this.equals(tempAssociate)) {
          this._updateInDb({ [fk]: this.id });

        // Non-self-referential
        } else if (!tempAssociate.isSaving) {
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

      let ownerId = this.id;
      if (inverse instanceof BelongsTo) {
        let newId;
        if (inverse.isPolymorphic) {
          newId = { type: this.modelName, id: ownerId };
        } else {
          newId = ownerId;
        }
        this._schema.db[toInternalCollectionName(model.modelName)].update(model.id, { [inverseFk]: newId });
      } else {
        let inverseCollection = this._schema.db[toInternalCollectionName(model.modelName)];
        let currentIdsForInverse = inverseCollection.find(model.id)[inverse.getForeignKey()] || [];
        let newIdsForInverse = _assign([], currentIdsForInverse);
        let newId, alreadyAssociatedWith;

        if (inverse.isPolymorphic) {
          newId = { type: this.modelName, id: ownerId };
          alreadyAssociatedWith = newIdsForInverse.some(key => (key.type == this.modelName && key.id == ownerId));
        } else {
          newId = ownerId;
          alreadyAssociatedWith = newIdsForInverse.indexOf(ownerId) !== -1;
        }

        if (!alreadyAssociatedWith) {
          newIdsForInverse.push(newId);
        }

        inverseCollection.update(model.id, { [inverseFk]: newIdsForInverse });
      }
    }
  }

  // Used to update data directly, since #save and #update can retrigger saves,
  // which can cause cycles with associations.
  _updateInDb(attrs) {
    this.attrs = this._schema.db[toInternalCollectionName(this.modelName)].update(this.attrs.id, attrs);
  }

  /**
    Simple string representation of the model and id.

    ```js
    let post = blogPosts.find(1);
    post.toString(); // "model:blogPost:1"
    ```

    @method toString
    @return {String}
    @public
  */
  toString() {
    let idLabel = this.id ? `(${this.id})` : '';

    return `model:${this.modelName}${idLabel}`;
  }

  /**
    Checks the equality of this model and the passed-in model
   *
    @method equals
    @return boolean
    @public
    @hide
   */
  equals(model) {
    return this.toString() === model.toString();
  }

}

Model.extend = extend;
Model.findBelongsToAssociation = function(associationType) {
  return this.prototype.belongsToAssociations[associationType];
};

export default Model;
