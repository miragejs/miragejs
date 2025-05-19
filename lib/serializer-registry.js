import { Model, Collection, PolymorphicCollection } from "./orm";
import Serializer from "./serializer";
import JsonApiSerializer from "./serializers/json-api-serializer";
import { camelize } from "./utils/inflector";
import assert from "./assert";

/**
 * SerializerRegistry manages the serialization of models and collections into JSON.
 * It handles different types of data structures and applies the appropriate serializer.
 *
 * @example
 * // Basic usage with a single model
 * const registry = new SerializerRegistry(schema, {
 *   application: RestSerializer,
 *   user: RestSerializer.extend({
 *     include: ['posts']
 *   })
 * });
 *
 * const user = schema.create('user', { name: 'John' });
 * const json = registry.serialize(user);
 * // Result: { user: { id: 1, name: 'John', postIds: [1, 2] } }
 *
 * @example
 * // Using with collections
 * const users = schema.all('user');
 * const json = registry.serialize(users);
 * // Result: { users: [{ id: 1, name: 'John' }] }
 *
 * @example
 * // Using with multiple collections
 * const users = schema.all('user');
 * const posts = schema.all('post');
 * const json = registry.serialize([users, posts]);
 * // Result: {
 * //   users: [{ id: 1, name: 'John' }],
 * //   posts: [{ id: 1, title: 'Hello' }]
 * // }
 *
 * @example
 * // Using with custom serializers
 * const registry = new SerializerRegistry(schema, {
 *   application: JSONAPISerializer,
 *   user: JSONAPISerializer.extend({
 *     include: ['posts'],
 *     attributes: ['name', 'email']
 *   })
 * });
 */
export default class SerializerRegistry {
  constructor(schema, serializerMap = {}, server) {
    this.schema = schema;
    this.inflector = schema.inflector;
    this._serializerMap = serializerMap;
  }

  /**
   * Registers new serializers in the registry.
   *
   * @param {Object} newSerializerMaps - Map of model types to serializers
   *
   * @example
   * // Register new serializers
   * registry.registerSerializers({
   *   post: RestSerializer.extend({
   *     include: ['comments']
   *   })
   * });
   */
  registerSerializers(newSerializerMaps) {
    let currentSerializerMap = this._serializerMap || {};
    this._serializerMap = Object.assign(
      currentSerializerMap,
      newSerializerMaps
    );
  }

  normalize(payload, modelName) {
    return this.serializerFor(modelName).normalize(payload);
  }

  /**
   * Serializes a model, collection, or array of collections into JSON.
   *
   * @param {Model|Collection|Array<Collection>|Object} data - The data to serialize
   * @param {Object} request - The request object for dynamic includes
   * @returns {Object} The serialized JSON
   *
   * @example
   * // Serialize a single model
   * const user = schema.create('user', { name: 'John' });
   * registry.serialize(user);
   * // Result: { user: { id: 1, name: 'John' } }
   *
   * @example
   * // Serialize a collection
   * const users = schema.all('user');
   * registry.serialize(users);
   * // Result: { users: [{ id: 1, name: 'John' }] }
   *
   * @example
   * // Serialize multiple collections
   * const users = schema.all('user');
   * const posts = schema.all('post');
   * registry.serialize([users, posts]);
   * // Result: {
   * //   users: [{ id: 1, name: 'John' }],
   * //   posts: [{ id: 1, title: 'Hello' }]
   * // }
   *
   * @example
   * // Serialize with dynamic includes
   * const request = { queryParams: { include: 'posts' } };
   * const user = schema.create('user', { name: 'John' });
   * registry.serialize(user, request);
   * // Result: {
   * //   user: { id: 1, name: 'John', postIds: [1, 2] },
   * //   posts: [
   * //     { id: 1, title: 'Hello', userId: 1 },
   * //     { id: 2, title: 'World', userId: 1 }
   * //   ]
   * // }
   */
  serialize(data, request) {
    this.request = request;

    if (this._isModelOrCollection(data)) {
      let serializer = this.serializerFor(data.modelName);
      return serializer.serialize(data, request);
    }

    if (this._isCollectionArray(data)) {
      return data.reduce((json, collection) => {
        let serializer = this.serializerFor(collection.modelName);

        if (serializer.embed) {
          json[this.inflector.pluralize(collection.modelName)] =
            serializer.serialize(collection, request);
        } else {
          json = Object.assign(json, serializer.serialize(collection, request));
        }

        return json;
      }, {});
    }

    return data;
  }

  /**
   * Gets the appropriate serializer for a given model type.
   * Falls back to application serializer if no specific serializer is found.
   *
   * @param {string} type - The model type
   * @param {Object} options - Options for serializer selection
   * @param {boolean} options.explicit - Whether to require an explicit serializer
   * @returns {Serializer} The serializer instance
   *
   * @example
   * // Get serializer for a specific model
   * const userSerializer = registry.serializerFor('user');
   *
   * @example
   * // Get serializer with explicit type
   * const userSerializer = registry.serializerFor('user', { explicit: true });
   * // Throws if no 'user' serializer is defined
   */
  serializerFor(type, { explicit = false } = {}) {
    let SerializerForResponse =
      type && this._serializerMap && this._serializerMap[camelize(type)];

    if (explicit) {
      assert(
        !!SerializerForResponse,
        `You passed in ${type} as an explicit serializer type but that serializer doesn't exist.`
      );
    } else {
      SerializerForResponse =
        SerializerForResponse || this._serializerMap.application || Serializer;

      assert(
        !SerializerForResponse ||
          SerializerForResponse.prototype.embed ||
          SerializerForResponse.prototype.root ||
          new SerializerForResponse() instanceof JsonApiSerializer,
        "You cannot have a serializer that sideloads (embed: false) and disables the root (root: false)."
      );
    }

    return new SerializerForResponse(this, type, this.request);
  }

  _isModel(object) {
    return object instanceof Model;
  }

  _isCollection(object) {
    return (
      object instanceof Collection || object instanceof PolymorphicCollection
    );
  }

  _isCollectionArray(object) {
    return (
      Array.isArray(object) &&
      object.length > 0 &&
      object.every(this._isCollection)
    );
  }

  _isModelOrCollection(object) {
    return this._isModel(object) || this._isCollection(object);
  }

  getCoalescedIds(request, modelName) {
    return this.serializerFor(modelName).getCoalescedIds(request);
  }
}
