import Model from 'ember-cli-mirage/orm/model';
import Collection from 'ember-cli-mirage/orm/collection';
import ActiveModelSerializer from 'ember-cli-mirage/serializers/active-model-serializer';
import JsonApiSerializer from 'ember-cli-mirage/serializers/json-api-serializer';
import { pluralize } from './utils/inflector';

import _assign from 'lodash/object/assign';
import _isArray from 'lodash/lang/isArray';

export default class SerializerRegistry {

  constructor(schema, serializerMap = {}) {
    this.schema = schema;
    this.baseSerializer = new ActiveModelSerializer();
    this._serializerMap = serializerMap;
  }

  normalize(payload) {
    return this._serializerFor(payload[Object.keys(payload)[0]]).normalize(payload);
  }

  serialize(response) {
    this.alreadySerialized = {};

    if (this._isModelOrCollection(response)) {
      let serializer = this._serializerFor(response);

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
        return serializer.serialize(response);
      }

      if (serializer.embed) {
        let json;

        if (this._isModel(response)) {
          json = this._serializeModel(response);
        } else {
          json = response.reduce((allAttrs, model) => {
            allAttrs.push(this._serializeModel(model));
            this._resetAlreadySerialized();

            return allAttrs;
          }, []);
        }

        return this._formatResponse(response, json);

      } else {
        return this._serializeSideloadedModelOrCollection(response);
      }

    /*
      Special case for an array of assorted collections (e.g. different types).

      The array shorthand can return this, e.g.
        this.get('/home', ['authors', 'photos'])
    */
    } else if (_isArray(response) && response.filter(item => (this._isCollection(item))).length) {
      return response.reduce((json, collection) => {
        let serializer = this._serializerFor(collection);

        if (serializer.embed) {
          json[pluralize(collection.type)] = this._serializeModelOrCollection(collection);
        } else {
          json = _assign(json, this._serializeSideloadedModelOrCollection(collection));
        }

        return json;
      }, {});


    } else {
      return response;
    }
  }

  _serializeSideloadedModelOrCollection(modelOrCollection) {
    if (this._isModel(modelOrCollection)) {
      return this._serializeSideloadedModelResponse(modelOrCollection);
    } else if (modelOrCollection.length) {

      return modelOrCollection.reduce((allAttrs, model) => {
        this._augmentAlreadySerialized(model);
        return this._serializeSideloadedModelResponse(model, true, allAttrs);
      }, {});

    // We have an empty collection
    } else {
      return {[pluralize(modelOrCollection.type)]: []};
    }
  }

  _serializeSideloadedModelResponse(model, topLevelIsArray = false, allAttrs = {}, root = null) {
    let serializer = this._serializerFor(model);

    // Add this model's attrs
    this._augmentAlreadySerialized(model);
    let modelAttrs = this._attrsForModel(model, false, true);
    let key = model.type;
    if (topLevelIsArray) {
      key = root ? root : pluralize(key);
      allAttrs[key] = allAttrs[key] || [];
      allAttrs[key].push(modelAttrs);
    } else {
      allAttrs[key] = modelAttrs;
    }

    // Traverse this model's relationships
    serializer.relationships
      .map(key => model[key])
      .forEach(relationship => {
        let relatedModels = this._isModel(relationship) ? [relationship] : relationship;

        relatedModels.forEach(relatedModel => {
          if (this._hasBeenSerialized(relatedModel)) {
            return;
          }

          this._serializeSideloadedModelResponse(relatedModel, true, allAttrs, serializer.keyForRelatedCollection(relatedModel.type));
        });
      });

    return allAttrs;
  }

  _formatResponse(modelOrCollection, attrs) {
    let serializer = this._serializerFor(modelOrCollection);
    let key = modelOrCollection.type;

    if (this._isCollection(modelOrCollection)) {
      key = pluralize(key);
    }

    return serializer.root ? { [key]: attrs } : attrs;
  }

  _serializeModelOrCollection(modelOrCollection, removeForeignKeys, serializeRelationships) {
    if (this._isModel(modelOrCollection)) {
      return this._serializeModel(modelOrCollection, removeForeignKeys, serializeRelationships);

    } else {
      return modelOrCollection.map(model => this._serializeModel(model, removeForeignKeys, serializeRelationships));
    }
  }

  _serializeModel(model, removeForeignKeys = true, serializeRelationships = true) {
    if (this._hasBeenSerialized(model)) {
      return;
    }

    let attrs = this._attrsForModel(model, removeForeignKeys);

    this._augmentAlreadySerialized(model);
    let relatedAttrs = serializeRelationships ? this._attrsForRelationships(model) : {};

    return _assign(attrs, relatedAttrs);
  }

  _attrsForModel(model, removeForeignKeys, embedRelatedIds) {
    let serializer = this._serializerFor(model);
    let attrs = serializer.serialize(model);

    if (removeForeignKeys) {
      model.fks.forEach(key => {
        delete attrs[key];
      });
    }

    if (embedRelatedIds) {
      serializer.relationships
        .map(key => model[key])
        .filter(relatedCollection => this._isCollection(relatedCollection))
        .forEach(relatedCollection => {
          attrs[serializer.keyForRelationshipIds(relatedCollection.type)] = relatedCollection.map(obj => obj.id);
        });
    }

    return attrs;
  }

  _attrsForRelationships(model) {
    let serializer = this._serializerFor(model);

    return serializer.relationships.reduce((attrs, key) => {
      let relatedAttrs = this._serializeModelOrCollection(model[key]);

      if (relatedAttrs) {
        attrs[key] = relatedAttrs;
      }

      return attrs;
    }, {});
  }

  _hasBeenSerialized(model) {
    let relationshipKey = `${model.type}Ids`;

    return (this.alreadySerialized[relationshipKey] && this.alreadySerialized[relationshipKey].indexOf(model.id) > -1);
  }

  _augmentAlreadySerialized(model) {
    let modelKey = `${model.type}Ids`;

    this.alreadySerialized[modelKey] = this.alreadySerialized[modelKey] || [];
    this.alreadySerialized[modelKey].push(model.id);
  }

  _resetAlreadySerialized() {
    this.alreadySerialized = {};
  }

  _serializerFor(modelOrCollection) {
    let type = modelOrCollection.type;
    let ModelSerializer = this._serializerMap && (this._serializerMap[type] || this._serializerMap['application']);

    /*
      TODO: This check should exist within the Serializer class, when the logic is moved from the registry to the
      individual serializers (see TODO above).
    */
    if (ModelSerializer && (!ModelSerializer.prototype.embed) && (!ModelSerializer.prototype.root) && (!(new ModelSerializer() instanceof JsonApiSerializer))) {
      throw 'Mirage: You cannot have a serializer that sideloads (embed: false) and disables the root (root: false).';
    }

    return ModelSerializer ? new ModelSerializer(this._serializerMap) : this.baseSerializer;
  }

  _isModel(object) {
    return object instanceof Model;
  }

  _isCollection(object) {
    return object instanceof Collection || (_isArray(object) && this._isModel(object[0]));
  }

  _isModelOrCollection(object) {
    return this._isModel(object) || this._isCollection(object);
  }

}
