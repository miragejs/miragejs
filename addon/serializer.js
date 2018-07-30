import Model from './orm/model';
import Collection from './orm/collection';
import PolymorphicCollection from './orm/polymorphic-collection';
import extend from './utils/extend';
import { singularize, pluralize, camelize } from './utils/inflector';
import assert from './assert';
import _isFunction from 'lodash/isFunction';
import _isArray from 'lodash/isArray';
import _isEmpty from 'lodash/isEmpty';
import _includes from 'lodash/includes';
import _assign from 'lodash/assign';
import _get from 'lodash/get';
import _ from 'lodash';

class Serializer {

  constructor(registry, type, request = {}) {
    this.registry = registry;
    this.type = type;
    this.request = request;
  }

  /**
   * Override this method to implement your own custom
   * serialize function. `primaryResource` is whatever was returned
   * from your route handler, and request is the Pretender
   * request object. Returns a plain JavaScript object or
   * array, which Mirage uses as the response data to your
   * Ember app’s XHR request. You can also override this method,
   * call super, and manipulate the data before Mirage responds
   * with it. This is a great place to add metadata, or for
   * one-off operations that don’t fit neatly into any of
   * Mirage’s other abstractions.
   * @method serialize
   * @param response
   * @param request
   * @public
   */
  serialize(primaryResource /* , request */) {
    return this.buildPayload(primaryResource);
  }

  buildPayload(primaryResource, toInclude, didSerialize, json) {
    if (!primaryResource && _isEmpty(toInclude)) {
      return json;

    } else if (primaryResource) {
      let [resourceHash, newIncludes] = this.getHashForPrimaryResource(primaryResource);
      let newDidSerialize = (this.isCollection(primaryResource) ? primaryResource.models : [primaryResource]);

      return this.buildPayload(undefined, newIncludes, newDidSerialize, resourceHash);

    } else {
      let nextIncludedResource = toInclude.shift();
      let [resourceHash, newIncludes] = this.getHashForIncludedResource(nextIncludedResource);

      let newToInclude = newIncludes
        .filter((resource) => {
          return !_includes(didSerialize.map((m) => m.toString()), resource.toString());
        })
        .concat(toInclude);
      let newDidSerialize = (this.isCollection(nextIncludedResource) ? nextIncludedResource.models : [nextIncludedResource])
        .concat(didSerialize);
      let newJson = this.mergePayloads(json, resourceHash);

      return this.buildPayload(undefined, newToInclude, newDidSerialize, newJson);
    }
  }

  getHashForPrimaryResource(resource) {
    let [hash, addToIncludes] = this.getHashForResource(resource);
    let hashWithRoot;

    if (this.root) {
      assert(
        !(resource instanceof PolymorphicCollection),
        `The base Serializer class cannot serialize a top-level PolymorphicCollection when root is true, since PolymorphicCollections have no type.`
      );

      let serializer = this.serializerFor(resource.modelName);
      let rootKey = serializer.keyForResource(resource);
      hashWithRoot = { [rootKey]: hash };
    } else {
      hashWithRoot = hash;
    }

    return [hashWithRoot, addToIncludes];
  }

  getHashForIncludedResource(resource) {
    let hashWithRoot, addToIncludes;

    if (resource instanceof PolymorphicCollection) {
      hashWithRoot = {};
      addToIncludes = resource.models;

    } else {
      let serializer = this.serializerFor(resource.modelName);
      let [ hash, newModels ] = serializer.getHashForResource(resource);

      // Included resources always have a root, and are always pushed to an array.
      let rootKey = serializer.keyForRelationship(resource.modelName);
      hashWithRoot = _isArray(hash) ? { [rootKey]: hash } : { [rootKey]: [hash] };
      addToIncludes = newModels;
    }

    return [ hashWithRoot, addToIncludes ];
  }

  getHashForResource(resource, removeForeignKeys = false, didSerialize = {}, lookupSerializer = false) {
    let hash,
      serializer;

    if (!lookupSerializer) {
      serializer = this; // this is used for embedded responses
    }

    // PolymorphicCollection lacks a modelName, but is dealt with in the map
    // by looking up the serializer on a per-model basis
    if (lookupSerializer && resource.modelName) {
      serializer = this.serializerFor(resource.modelName);
    }

    if (this.isModel(resource)) {
      hash = serializer._hashForModel(resource, removeForeignKeys, didSerialize);
    } else {
      hash = resource.models.map((m) => {
        let modelSerializer = serializer;

        if (!modelSerializer) {
          // Can't get here if lookupSerializer is false, so look it up
          modelSerializer = this.serializerFor(m.modelName);
        }

        return modelSerializer._hashForModel(m, removeForeignKeys, didSerialize);
      });
    }

    if (this.embed) {
      return [hash, []];

    } else {
      let addToIncludes = _(serializer.getKeysForIncluded())
        .map((key) => {
          if (this.isCollection(resource)) {
            return resource.models.map((m) => m[key]);
          } else {
            return resource[key];
          }
        })
        .flatten()
        .compact()
        .uniqBy(m => m.toString())
        .value();

      return [hash, addToIncludes];
    }
  }

  /*
    Merges new resource hash into json. If json already has root key,
    pushes value of resourceHash onto that key.

    For example,

        json = {
          post: { id: 1, title: 'Lorem Ipsum', comment_ids: [1, 3] },
          comments: [
            { id: 1, text: 'foo' }
          ]
        };

        resourceHash = {
          comments: [
            { id: 2, text: 'bar' }
          ]
        };

    would yield

        {
          post: { id: 1, title: 'Lorem Ipsum', comment_ids: [1, 3] },
          comments: [
            { id: 1, text: 'foo' },
            { id: 2, text: 'bar' }
          ]
        };

  */
  mergePayloads(json, resourceHash) {
    let newJson;
    let [resourceHashKey] = Object.keys(resourceHash);

    if (json[resourceHashKey]) {
      newJson = json;
      newJson[resourceHashKey] = json[resourceHashKey].concat(resourceHash[resourceHashKey]);
    } else {
      newJson = _assign(json, resourceHash);
    }

    return newJson;
  }

  keyForResource(resource) {
    let { modelName } = resource;
    return this.isModel(resource) ? this.keyForModel(modelName) : this.keyForCollection(modelName);
  }

  /**
   * Used to define a custom key when serializing a
   * primary model of modelName `modelName`.
   * @method keyForModel
   * @param modelName
   * @public
   */
  keyForModel(modelName) {
    return camelize(modelName);
  }

  /**
   * Used to customize the key when serializing a primary
   * collection. By default this pluralizes the return
   * value of `keyForModel`.
   * @method keyForCollection
   * @param modelName
   * @public
   */
  keyForCollection(modelName) {
    return pluralize(this.keyForModel(modelName));
  }

  _hashForModel(model, removeForeignKeys, didSerialize = {}) {
    let attrs = this._attrsForModel(model);

    if (removeForeignKeys) {
      model.fks.forEach((fk) => {
        delete attrs[fk];
      });
    }

    if (this.embed) {
      let newDidSerialize = _assign({}, didSerialize);
      newDidSerialize[model.modelName] = newDidSerialize[model.modelName] || {};
      newDidSerialize[model.modelName][model.id] = true;

      this.getKeysForIncluded().forEach((key) => {
        let associatedResource = model[key];
        if (associatedResource && !_get(newDidSerialize, `${associatedResource.modelName}.${associatedResource.id}`)) {
          let [ associatedResourceHash ] = this.getHashForResource(associatedResource, true, newDidSerialize, true);
          let formattedKey = this.keyForEmbeddedRelationship(key);
          attrs[formattedKey] = associatedResourceHash;

          if (this.isModel(associatedResource)) {
            let fk = `${camelize(key)}Id`;
            delete attrs[fk];
          }
        }
      });

      return attrs;
    } else {
      return this._maybeAddAssociationIds(model, attrs);
    }
  }

  /**
   * @method _attrsForModel
   * @param model
   * @private
   */
  _attrsForModel(model) {
    let attrs = {};

    if (this.attrs) {
      attrs = this.attrs.reduce((memo, attr) => {
        memo[attr] = model[attr];
        return memo;
      }, {});
    } else {
      attrs = _assign(attrs, model.attrs);
    }

    // Remove fks
    model.fks.forEach(key => delete attrs[key]);

    return this._formatAttributeKeys(attrs);
  }

  /**
   * @method _maybeAddAssociationIds
   * @param model
   * @param attrs
   * @private
   */
  _maybeAddAssociationIds(model, attrs) {
    let newHash = _assign({}, attrs);

    if (this.serializeIds === 'always') {
      model.associationKeys.forEach((key) => {
        let resource = model[key];

        if (this.isCollection(resource)) {
          let formattedKey = this.keyForRelationshipIds(key);
          newHash[formattedKey] = model[`${singularize(key)}Ids`];

        } else if (resource) {
          let formattedKey = this.keyForForeignKey(key);
          newHash[formattedKey] = model[`${key}Id`];
        }
      });

    } else if (this.serializeIds === 'included') {
      this.getKeysForIncluded().forEach((key) => {
        let resource = model[key];
        let association = model.associationFor(key);

        if (this.isCollection(resource)) {
          let formattedKey = this.keyForRelationshipIds(key);

          newHash[formattedKey] = model[`${singularize(key)}Ids`];

        } else if (this.isModel(resource) && association.isPolymorphic) {
          let formattedTypeKey = this.keyForPolymorphicForeignKeyType(key);
          let formattedIdKey = this.keyForPolymorphicForeignKeyId(key);

          newHash[formattedTypeKey] = model[`${key}Id`].type;
          newHash[formattedIdKey] = model[`${key}Id`].id;

        } else if (this.isModel(resource)) {
          let formattedKey = this.keyForForeignKey(key);

          newHash[formattedKey] = model[`${key}Id`];
        }
      });
    }

    return newHash;
  }

  /**
   * Used to customize how a model’s attribute is
   * formatted in your JSON payload.
   * @method keyForAttribute
   * @param attr
   * @public
   */
  keyForAttribute(attr) {
    return attr;
  }

  /**
   * Use this hook to format the key for collections
   * related to this model.
   *
   * For example, if you're serializing an author that
   * side loads many `blogPosts`, you would get `blogPost`
   * as an argument, and whatever you return would
   * end up as the collection key in your JSON:
   *
   * keyForRelationship(type) {
   *   return dasherize(type);
   * }
   *
   * {
   *   author: {...},
   *   'blog-posts': [...]
   * }
   * @method keyForRelationship
   * @param modelName
   * @public
   */
  keyForRelationship(modelName) {
    return camelize(pluralize(modelName));
  }

  /**
   * @method keyForEmbeddedRelationship
   * @param attributeName
   * @public
   */
  keyForEmbeddedRelationship(attributeName) {
    return camelize(attributeName);
  }

  /**
   * Use this hook to format the key for relationship ids
   * in this model's JSON representation.
   *
   * For example, if you're serializing an author that
   * side loads many `blogPosts`, you would get `blogPost`
   * as an argument, and whatever you return would
   * end up as part of the `author` JSON:
   *
   * keyForRelationshipIds(type) {
   *   return dasherize(type) + '-ids';
   * }
   *
   * {
   *   author: {
   *     ...,
   *     'blog-post-ids': [1, 2, 3]
   *   },
   *   'blog-posts': [...]
   * }
   * @method keyForRelationshipIds
   * @param modelName
   * @public
   */
  keyForRelationshipIds(relationshipName) {
    return `${singularize(camelize(relationshipName))}Ids`;
  }

  keyForForeignKey(relationshipName) {
    return `${camelize(relationshipName)}Id`;
  }

  keyForPolymorphicForeignKeyId(relationshipName) {
    return `${camelize(relationshipName)}Id`;
  }

  keyForPolymorphicForeignKeyType(relationshipName) {
    return `${camelize(relationshipName)}Type`;
  }

  /**
   * This method is used by the POST and PUT shorthands. These shorthands
   * expect a valid JSON:API document as part of the request, so that
   * they know how to create or update the appropriate resouce. The normalize
   * method allows you to transform your request body into a JSON:API
   * document, which lets you take advantage of the shorthands when you
   * otherwise may not be able to.
   *
   * Note that this method is a noop if you’re using JSON:API already,
   * since request payloads sent along with POST and PUT requests will
   * already be in the correct format.
   * @method normalize
   * @param json
   * @public
   */
  normalize(json) {
    return json;
  }

  /**
   * @method isModel
   * @param object
   * @return {Boolean}
   * @public
   */
  isModel(object) {
    return object instanceof Model;
  }

  /**
   * @method isCollection
   * @param object
   * @return {Boolean}
   * @public
   */
  isCollection(object) {
    return (object instanceof Collection) || (object instanceof PolymorphicCollection);
  }

  /**
   * @method isModelOrCollection
   * @param object
   * @return {Boolean}
   * @public
   */
  isModelOrCollection(object) {
    return this.isModel(object) || this.isCollection(object);
  }

  /**
   * @method serializerFor
   * @param type
   * @public
   */
  serializerFor(type) {
    return this.registry.serializerFor(type);
  }

  getKeysForIncluded() {
    return _isFunction(this.include) ? this.include(this.request) : this.include;
  }

  get schema() {
    return this.registry.schema;
  }

  /**
   * @method _formatAttributeKeys
   * @param attrs
   * @private
   */
  _formatAttributeKeys(attrs) {
    let formattedAttrs = {};

    for (let key in attrs) {
      let formattedKey = this.keyForAttribute(key);
      formattedAttrs[formattedKey] = attrs[key];
    }

    return formattedAttrs;
  }

  getCoalescedIds(/* request */) {
  }
}

// Defaults
Serializer.prototype.include = [];
Serializer.prototype.root = true;
Serializer.prototype.embed = false;
Serializer.prototype.serializeIds = 'included'; // can be 'included', 'always', or 'never'

Serializer.extend = extend;

export default Serializer;
