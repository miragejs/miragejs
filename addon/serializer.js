import Model from './orm/model';
import Collection from './orm/collection';
import _assign from 'lodash/object/assign';
import _compose from 'lodash/function/compose';
import extend from './utils/extend';
import { singularize, pluralize, camelize } from './utils/inflector';

import _isFunction from 'lodash/lang/isFunction';

class Serializer {

  constructor(registry, type, included=[], alreadySerialized={}) {
    this.registry = registry;
    this.type = type;
    this.included = included;
    this.alreadySerialized = alreadySerialized;
  }

  /**
   * Override this method to implement your own custom
   * serialize function. response is whatever was returned
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
  serialize(response, request={}) {
    if (this.embed) {
      let json;

      if (this.isModel(response)) {
        json = this._serializeModel(response, request);
      } else {
        json = response.models.reduce((allAttrs, model) => {
          allAttrs.push(this._serializeModel(model));
          this._resetAlreadySerialized();

          return allAttrs;
        }, []);
      }

      return this._formatResponse(response, json);

    } else {
      return this._serializeSideloadedModelOrCollection(response, request);
    }
  }

  oldSerialize(response, request) {
    if (response instanceof Model) {
      return this._oldAttrsForModel(response);
    } else {
      return response;
    }
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
    return _compose(camelize, pluralize)(modelName);
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
  keyForRelationshipIds(modelName) {
    return `${singularize(camelize(modelName))}Ids`;
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
    return object instanceof Collection;
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
    return this.registry.serializerFor(type, {
      included: this.included,
      alreadySerialized: this.alreadySerialized
    });
  }

  /*
     Private methods
   */

  /**
   * @method _serializerModel
   * @param model
   * @param request
   * @param removeForeignKeys
   * @param serializeRelationships
   * @private
   */
  _serializeModel(model, request, removeForeignKeys = true, serializeRelationships = true) {
    if (this._hasBeenSerialized(model)) {
      return;
    }

    let attrs = this._attrsForModel(model, request, removeForeignKeys);

    this._augmentAlreadySerialized(model);
    let relatedAttrs = serializeRelationships ? this._attrsForRelationships(model, request) : {};

    return _assign(attrs, relatedAttrs);
  }

  /**
   * @method _oldAttrsForModel
   * @param model
   * @private
   */
  _oldAttrsForModel(model) {
    let attrs = {};

    if (this.attrs) {
      attrs = this.attrs.reduce((memo, attr) => {
        memo[attr] = model[attr];
        return memo;
      }, {});
    } else {
      attrs = _assign(attrs, model.attrs);
    }

    return this._formatAttributeKeys(attrs);
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

  /**
   * @method _resetAlreadySerialized
   * @private
   */
  _resetAlreadySerialized() {
    this.alreadySerialized = {};
  }

  /**
   * @method _serializeSideloadedModelOrCollection
   * @param modelOrCollection
   * @param request
   * @private
   */
  _serializeSideloadedModelOrCollection(modelOrCollection, request) {
    if (this.isModel(modelOrCollection)) {
      return this._serializeSideloadedModelResponse(modelOrCollection, request);
    } else if (modelOrCollection.models && modelOrCollection.models.length) {

      return modelOrCollection.models.reduce((allAttrs, model) => {
        return this._serializeSideloadedModelResponse(model, request, true, allAttrs);
      }, {});

      // We have an empty collection
    } else {
      return { [this._keyForModelOrCollection(modelOrCollection)]: [] };
    }
  }

  /**
   * @method _serializeSideloadedModelResponse
   * @param model
   * @param request
   * @param [topLevelIsArray=false]
   * @param allAttrs
   * @param [root=null]
   * @private
   */
  _serializeSideloadedModelResponse(model, request, topLevelIsArray = false, allAttrs = {}, root = null) {
    if (this._hasBeenSerialized(model)) {
      return allAttrs;
    }

    // Add this model's attrs
    this._augmentAlreadySerialized(model);
    let modelAttrs = this._attrsForModel(model, request, false, true);
    let key = this._keyForModelOrCollection(model);

    if (topLevelIsArray) {
      key = root ? root : pluralize(key);
      allAttrs[key] = allAttrs[key] || [];
      allAttrs[key].push(modelAttrs);
    } else {
      allAttrs[key] = modelAttrs;
    }

    // Traverse this model's relationships
    this._valueForInclude(this, request)
    .map(key => model[camelize(key)])
    .filter(Boolean)
    .forEach(relationship => {
      let relatedModels = this.isModel(relationship) ? [relationship] : relationship.models;

      relatedModels.forEach(relatedModel => {
        let serializer = this.serializerFor(relatedModel.modelName);
        serializer._serializeSideloadedModelResponse(relatedModel, request, true, allAttrs, serializer.keyForRelationship(relatedModel.modelName));
      });
    });

    return allAttrs;
  }

  /**
   * @method _formatResponse
   * @param modelOrCollection
   * @param attrs
   * @private
   */
  _formatResponse(modelOrCollection, attrs) {
    let serializer = this.serializerFor(modelOrCollection.modelName);
    let key = this._keyForModelOrCollection(modelOrCollection);

    return serializer.root ? { [key]: attrs } : attrs;
  }

  /**
   * @method _serializeModelOrCollection
   * @param modelOrCollection
   * @param request
   * @param removeForeignKeys
   * @param serializeRelationships
   * @private
   */
  _serializeModelOrCollection(modelOrCollection, request, removeForeignKeys, serializeRelationships) {
    if (this.isModel(modelOrCollection)) {
      return this._serializeModel(modelOrCollection, request, removeForeignKeys, serializeRelationships);
    } else {
      return modelOrCollection.models.map(model => {
        return this._serializeModel(model, request, removeForeignKeys, serializeRelationships);
      });
    }
  }

  /**
   * @method _attrsForModel
   * @param model
   * @param request
   * @param removeForeignKeys
   * @param embedRelatedIds
   * @private
   */
  _attrsForModel(model, request, removeForeignKeys, embedRelatedIds) {
    let attrs = this.oldSerialize(model, request);

    if (removeForeignKeys) {
      model.fks.forEach(key => {
        delete attrs[key];
      });
    }

    if (embedRelatedIds) {
      this._valueForInclude(this, request)
      .map(key => model[camelize(key)])
      .filter(this.isCollection)
      .forEach(relatedCollection => {
        attrs[this.keyForRelationshipIds(relatedCollection.modelName)] = relatedCollection.models.map(model => model.id);
      });
    }

    return attrs;
  }

  /**
   * @method _attrsForRelationships
   * @param model
   * @param request
   * @private
   */
  _attrsForRelationships(model, request) {
    return this._valueForInclude(this, request)
    .reduce((attrs, key) => {
      let modelOrCollection = model[camelize(key)];
      let serializer = this.serializerFor(modelOrCollection.modelName);
      let relatedAttrs = serializer._serializeModelOrCollection(modelOrCollection, request);

      if (relatedAttrs) {
        if (this.isModel(modelOrCollection)) {
          attrs[this.keyForModel(key)] = relatedAttrs;
        } else {
          attrs[this.keyForRelationship(key)] = relatedAttrs;
        }
      }

      return attrs;
    }, {});
  }

  /**
   * @method _hasBeenSerialized
   * @param model
   * @private
   */
  _hasBeenSerialized(model) {
    let relationshipKey = `${camelize(model.modelName)}Ids`;

    return (this.alreadySerialized[relationshipKey] && this.alreadySerialized[relationshipKey].indexOf(model.id) > -1);
  }

  /**
   * @method _augmentAlreadySerialized
   * @param model
   * @private
   */
  _augmentAlreadySerialized(model) {
    let modelKey = `${camelize(model.modelName)}Ids`;

    this.alreadySerialized[modelKey] = this.alreadySerialized[modelKey] || [];
    this.alreadySerialized[modelKey].push(model.id);
  }

  /**
   * @method _keyForModelOrCollection
   * @param modelOrCollection
   * @private
   */
  _keyForModelOrCollection(modelOrCollection) {
    let serializer = this.serializerFor(modelOrCollection.modelName);

    if (this.isModel(modelOrCollection)) {
      return serializer.keyForModel(modelOrCollection.modelName);
    } else {
      return serializer.keyForCollection(modelOrCollection.modelName);
    }
  }

  /**
   * @method _valueForInclude
   * @param serializer
   * @param request
   * @private
   */
  _valueForInclude(serializer, request) {
    let { include } = serializer;

    if (_isFunction(include)) {
      return include(request);
    } else {
      return include;
    }
  }
}

// Defaults
Serializer.prototype.include = [];
Serializer.prototype.root = true;
Serializer.prototype.embed = false;

Serializer.extend = extend;

export default Serializer;
