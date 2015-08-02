import Model from 'ember-cli-mirage/orm/model';
import Collection from 'ember-cli-mirage/orm/collection';
import Serializer from 'ember-cli-mirage/serializer';
import { pluralize } from './utils/inflector';

export default class SerializerRegistry {

  constructor(schema, serializerMap = {}) {
    this.schema = schema;
    this.baseSerializer = new Serializer();
    this._serializerMap = serializerMap;
  }

  serialize(response) {
    if (response instanceof Model) {
      return this._serializeModel(response);

    } else if (response instanceof Collection) {
      return this._serializeCollection(response);

    } else {
      return response;
    }
  }

  serializeRelationship(modelOrCollection, alreadySerialized = {}) {
    if (modelOrCollection instanceof Model) {
      return this._serializeModel(modelOrCollection, true, alreadySerialized);

    } else if (modelOrCollection instanceof Collection) {
      return this._serializeCollection(modelOrCollection, true, alreadySerialized);

    }
  }

  _serializeModel(model, isRelatedModel = false, alreadySerialized = {}) {
    let serializer = this._serializerFor(model);
    let attrs = this._attrsForModel(model, isRelatedModel, alreadySerialized);

    if (isRelatedModel) {
      return attrs;
    } else {
      return serializer.root ? { [model.type]: attrs } : attrs;
    }
  }

  _serializeCollection(collection, isRelatedModel = false, alreadySerialized = {}) {
    let key = pluralize(collection.type);
    let serializer = this._serializerFor(collection.type);
    let allAttrs = collection.map(model => this._attrsForModel(model, isRelatedModel, alreadySerialized));

    if (isRelatedModel) {
      return allAttrs;
    } else {
      return serializer.root ? { [key]: allAttrs } : allAttrs;
    }
  }

  _attrsForModel(model, isRelatedModel = false, alreadySerialized = {}) {
    let serializer = this._serializerFor(model);
    let attrs = serializer.serialize(model);

    // Keep track that we've serialized this model
    let modelKey = `${model.type}_ids`;
    alreadySerialized[modelKey] = alreadySerialized[modelKey] || [];
    alreadySerialized[modelKey].push(model.id);

    // If we're getting attrs for a related model, strip out the fks
    if (isRelatedModel) {
      model.fks.forEach(key => {
        delete attrs[key];
      });
    }

    serializer.relationships.forEach(key => {
      let relationship = model[key];
      let relationshipKey = `${relationship.type}_ids`;
      alreadySerialized[relationshipKey] = alreadySerialized[relationshipKey] || [];

      // Only serialize models that haven't already been serialized
      if (alreadySerialized[`${relationship.type}_ids`].indexOf(relationship.id) === -1) {
        let relationshipAttrs = this.serializeRelationship(relationship, alreadySerialized);
        attrs[key] = relationshipAttrs;
      }
    });

    return attrs;
  }

  _serializerFor(modelOrType) {
    let type = modelOrType instanceof Model ? modelOrType.type : modelOrType;
    let ModelSerializer = this._serializerMap[type];

    return ModelSerializer ? new ModelSerializer() : this.baseSerializer;
  }

}
