import Model from 'ember-cli-mirage/orm/model';
import Collection from 'ember-cli-mirage/orm/collection';
import Serializer from 'ember-cli-mirage/serializer';
import { singularize, pluralize } from './utils/inflector';

export default class SerializerRegistry {

  constructor(schema, serializerMap = {}) {
    this.schema = schema;
    this.baseSerializer = new Serializer();
    this._serializerMap = serializerMap;
  }

  serialize(response) {
    this.alreadySerialized = {};

    if (response instanceof Model || response instanceof Collection) {
      let serializer = this._serializerFor(response);

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

    } else {
      return response;
    }
  }

  _serializeSideloadedModelOrCollection(response) {
    if (this._isModel(response)) {
      return this._serializeSideloadedModelResponse(response);
    } else {

      return response.reduce((allAttrs, model) => {
        this._augmentAlreadySerialized(model);
        return this._serializeSideloadedModelResponse(model, true, allAttrs);
      }, {});
    }
  }

  _serializeSideloadedModelResponse(model, topLevelIsArray = false, allAttrs = {}) {
    // Add this model's attrs
    this._augmentAlreadySerialized(model);
    let modelAttrs = this._attrsForModel(model, false, true);
    let key = model.type;
    if (topLevelIsArray) {
      key = pluralize(key);
      allAttrs[key] = allAttrs[key] || [];
      allAttrs[key].push(modelAttrs);
    } else {
      allAttrs[key] = modelAttrs;
    }

    // Traverse this model's relationships
    let serializer = this._serializerFor(model);
    serializer.relationships
      .map(key => model[key])
      .forEach(relationship => {
        if (relationship instanceof Collection) {
          relationship.forEach(relatedModel => {
            if (this._hasBeenSerialized(relatedModel)) {
              return;
            }
            this._serializeSideloadedModelResponse(relatedModel, true, allAttrs);
          });
        } else {
          if (this._hasBeenSerialized(relationship)) {
            return;
          }

          this._serializeSideloadedModelResponse(relationship, true, allAttrs);
        }
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

    return _.assign(attrs, relatedAttrs);
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
        .filter(relatedCollection => relatedCollection instanceof Collection)
        .forEach(relatedCollection => {
          attrs[`${singularize(relatedCollection.type)}_ids`] = relatedCollection.map(obj => obj.id);
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
    let relationshipKey = `${model.type}_ids`;

    return (this.alreadySerialized[relationshipKey] && this.alreadySerialized[relationshipKey].indexOf(model.id) > -1);
  }

  _augmentAlreadySerialized(model) {
    let modelKey = `${model.type}_ids`;

    this.alreadySerialized[modelKey] = this.alreadySerialized[modelKey] || [];
    this.alreadySerialized[modelKey].push(model.id);
  }

  _resetAlreadySerialized() {
    this.alreadySerialized = {};
  }

  _serializerFor(modelOrCollection) {
    let type = modelOrCollection.type;
    let ModelSerializer = this._serializerMap[type];

    if (ModelSerializer && (!ModelSerializer.prototype.embed) && (!ModelSerializer.prototype.root)) {
      throw 'Mirage: You cannot have a serializer that sideloads (embed: false) and disables the root (root: false).';
    }

    return ModelSerializer ? new ModelSerializer() : this.baseSerializer;
  }

  _isModel(object) {
    return object instanceof Model;
  }

  _isCollection(object) {
    return object instanceof Collection;
  }

}
