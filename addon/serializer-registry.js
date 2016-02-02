import Model from 'ember-cli-mirage/orm/model';
import Collection from 'ember-cli-mirage/orm/collection';
import Serializer from 'ember-cli-mirage/serializer';
import JsonApiSerializer from 'ember-cli-mirage/serializers/json-api-serializer';
import { pluralize, camelize } from './utils/inflector';
import assert from './assert';

import _assign from 'lodash/object/assign';
import _isArray from 'lodash/lang/isArray';
import _isFunction from 'lodash/lang/isFunction';

function isModel(object) {
  return object instanceof Model;
}

function isCollection(object) {
  return object instanceof Collection;
}

export default class SerializerRegistry {

  constructor(schema, serializerMap = {}) {
    this.schema = schema;
    this.baseSerializer = new Serializer();
    this._serializerMap = serializerMap;
  }

  normalize(payload, modelName) {
    return this._serializerFor(modelName).normalize(payload);
  }

  serialize(response, request) {
    this.alreadySerialized = {};

    if (this._isModelOrCollection(response)) {
      let serializer = this._serializerFor(response.modelName);

      /*
        TODO:
        I'm using JsonApiSerializer as a sandbox to try to identify
        the inteface a serializer should have. Currently, SerializerRegistry
        does a lot of work specific to sideloaded/embedded-type responses.
        If we pass the serializerMap/a container into Serializer instances,
        Registry should simplify to just instantiating the appropriate serializer,
        and calling serialize.serialize.
      */
      if (serializer instanceof JsonApiSerializer) {
        return serializer.serialize(response, request);
      }

      if (serializer.embed) {
        let json;

        if (isModel(response)) {
          json = this._serializeModel(response, request);
        } else {
          json = response.reduce((allAttrs, model) => {
            allAttrs.push(this._serializeModel(model));
            this._resetAlreadySerialized();

            return allAttrs;
          }, []);
        }

        return this._formatResponse(response, json);

      } else {
        return this._serializeSideloadedModelOrCollection(response, request);
      }

    /*
      Special case for an array of assorted collections (e.g. different types).

      The array shorthand can return this, e.g.
        this.get('/home', ['authors', 'photos'])
    */
    } else if (_isArray(response) && response.filter(isCollection).length) {
      return response.reduce((json, collection) => {
        let serializer = this._serializerFor(collection.modelName);

        if (serializer.embed) {
          json[pluralize(collection.modelName)] = this._serializeModelOrCollection(collection, request);
        } else {
          json = _assign(json, this._serializeSideloadedModelOrCollection(collection, request));
        }

        return json;
      }, {});

    } else {
      return response;
    }
  }

  _serializeSideloadedModelOrCollection(modelOrCollection, request) {
    if (isModel(modelOrCollection)) {
      return this._serializeSideloadedModelResponse(modelOrCollection, request);
    } else if (modelOrCollection.length) {

      return modelOrCollection.reduce((allAttrs, model) => {
        this._augmentAlreadySerialized(model);
        return this._serializeSideloadedModelResponse(model, request, true, allAttrs);
      }, {});

    // We have an empty collection
    } else {
      return {[this._keyForModelOrCollection(modelOrCollection)]: []};
    }
  }

  _serializeSideloadedModelResponse(model, request, topLevelIsArray = false, allAttrs = {}, root = null) {
    let serializer = this._serializerFor(model.modelName);

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
    this._valueForInclude(serializer, request)
      .map(key => model[camelize(key)])
      .filter(Boolean)
      .forEach(relationship => {
        let relatedModels = isModel(relationship) ? [relationship] : relationship;

        relatedModels.forEach(relatedModel => {
          if (this._hasBeenSerialized(relatedModel)) {
            return;
          }

          this._serializeSideloadedModelResponse(relatedModel, request, true, allAttrs, serializer.keyForRelationship(relatedModel.modelName));
        });
      });

    return allAttrs;
  }

  _formatResponse(modelOrCollection, attrs) {
    let serializer = this._serializerFor(modelOrCollection.modelName);
    let key = this._keyForModelOrCollection(modelOrCollection);

    return serializer.root ? { [key]: attrs } : attrs;
  }

  _serializeModelOrCollection(modelOrCollection, request, removeForeignKeys, serializeRelationships) {
    if (isModel(modelOrCollection)) {
      return this._serializeModel(modelOrCollection, request, removeForeignKeys, serializeRelationships);
    } else {
      return modelOrCollection
        .map(model => this._serializeModel(model, request, removeForeignKeys, serializeRelationships));
    }
  }

  _serializeModel(model, request, removeForeignKeys = true, serializeRelationships = true) {
    if (this._hasBeenSerialized(model)) {
      return;
    }

    let attrs = this._attrsForModel(model, request, removeForeignKeys);

    this._augmentAlreadySerialized(model);
    let relatedAttrs = serializeRelationships ? this._attrsForRelationships(model, request) : {};

    return _assign(attrs, relatedAttrs);
  }

  _attrsForModel(model, request, removeForeignKeys, embedRelatedIds) {
    let serializer = this._serializerFor(model.modelName);
    let attrs = serializer.serialize(model, request);

    if (removeForeignKeys) {
      model.fks.forEach(key => {
        delete attrs[key];
      });
    }

    if (embedRelatedIds) {
      this._valueForInclude(serializer, request)
        .map(key => model[camelize(key)])
        .filter(isCollection)
        .forEach(relatedCollection => {
          attrs[serializer.keyForRelationshipIds(relatedCollection.modelName)] = relatedCollection.map(obj => obj.id);
        });
    }

    return attrs;
  }

  _attrsForRelationships(model, request) {
    let serializer = this._serializerFor(model.modelName);

    return this._valueForInclude(serializer, request).reduce((attrs, key) => {
      let relatedAttrs = this._serializeModelOrCollection(model[camelize(key)], request);

      if (relatedAttrs) {
        attrs[camelize(key)] = relatedAttrs;
      }

      return attrs;
    }, {});
  }

  _hasBeenSerialized(model) {
    let relationshipKey = `${camelize(model.modelName)}Ids`;

    return (this.alreadySerialized[relationshipKey] && this.alreadySerialized[relationshipKey].indexOf(model.id) > -1);
  }

  _augmentAlreadySerialized(model) {
    let modelKey = `${camelize(model.modelName)}Ids`;

    this.alreadySerialized[modelKey] = this.alreadySerialized[modelKey] || [];
    this.alreadySerialized[modelKey].push(model.id);
  }

  _resetAlreadySerialized() {
    this.alreadySerialized = {};
  }

  _serializerFor(modelName) {
    let camelizedModelName = modelName ? camelize(modelName) : null;
    let ModelSerializer = this._serializerMap && (this._serializerMap[camelizedModelName] || this._serializerMap['application']);

    /*
      TODO: This check should exist within the Serializer class, when the logic is moved from the registry to the
      individual serializers (see TODO above).
    */
    assert(
      !ModelSerializer ||
      (ModelSerializer.prototype.embed) ||
      (ModelSerializer.prototype.root) ||
      (new ModelSerializer() instanceof JsonApiSerializer),
      'You cannot have a serializer that sideloads (embed: false) and disables the root (root: false).'
    );

    return ModelSerializer ? new ModelSerializer(this._serializerMap) : this.baseSerializer;
  }

  _isModelOrCollection(object) {
    return isModel(object) || isCollection(object);
  }

  _keyForModelOrCollection(modelOrCollection) {
    let serializer = this._serializerFor(modelOrCollection.modelName);

    if (isModel(modelOrCollection)) {
      return serializer.keyForModel(modelOrCollection.modelName);
    } else {
      return serializer.keyForCollection(modelOrCollection.modelName);
    }
  }

  _valueForInclude(serializer, request) {
    let include = serializer.include;
    if (_isFunction(include)) {
      return include(request);
    } else {
      return include;
    }
  }
}
