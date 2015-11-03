import extend from '../utils/extend';
import { dasherize, pluralize } from '../utils/inflector';
import Model from 'ember-cli-mirage/orm/model';
import Collection from 'ember-cli-mirage/orm/collection';
import _assign from 'lodash/object/assign';

class JsonApiSerializer {

  constructor(serializerMap) {
    this._serializerMap = serializerMap;
    this.included = [];
    this.alreadySerialized = {};
  }

  serialize(modelOrCollection, request) {
    let response;

    if (modelOrCollection instanceof Model) {
      response = this._serializePrimaryModel(modelOrCollection, request);
    } else {
      response = this._serializePrimaryCollection(modelOrCollection, request);
    }

    if (this.included.length) {
      response.included = this.included;
    }

    return response;
  }

  _serializePrimaryModel(model, request) {
    this._augmentAlreadySerialized(model);

    let response = {
      data: this._resourceObjectFor(model)
    };

    this._serializeRelationshipsFor(model);

    return response;
  }

  _serializePrimaryCollection(collection, request) {
    let response = {
      data: collection.map(model => this._resourceObjectFor(model))
    };

    collection.forEach(model => {
      this._serializeRelationshipsFor(model);
    });

    return response;
  }

  _serializeRelationshipsFor(model) {
    let serializer = this._serializerFor(model);

    if (serializer.relationships && serializer.relationships.length) {
      serializer.relationships.forEach(type => {
        let relationship = model[type];

        if (relationship instanceof Model) {
          this._serializeIncludedModel(relationship);
        } else if (relationship) {
          relationship.forEach(model => {
            this._serializeIncludedModel(model);
          });
        }
      });
    }
  }

  _serializeIncludedModel(model, request) {
    if (this._hasBeenSerialized(model)) {
      return;
    }
    this._augmentAlreadySerialized(model);

    this.included.push(this._resourceObjectFor(model));
    this._serializeRelationshipsFor(model);
  }

  _resourceObjectFor(model) {
    let serializer = this._serializerFor(model);
    const attrs = this._attrsForModel(model);

    const obj = {
      type: this.typeKeyForModel(model),
      id: model.id,
      attributes: attrs
    };

    if (serializer.relationships && serializer.relationships.length) {
      serializer.relationships.forEach(type => {
        let relationship = model[type];

        if (this._isCollection(relationship)) {
          if (!obj.relationships) { obj.relationships = {}; }
          obj.relationships[type] = {
            data: relationship.map(model => {
              return {
                type: this.typeKeyForModel(model),
                id: model.id
              };
            })
          };
        } else if (relationship) {
          if (!obj.relationships) { obj.relationships = {}; }
          obj.relationships[type] = {
            data: {
              type: this.typeKeyForModel(relationship),
              id: relationship.id
            }
          };
        }
      });
    }

    return obj;
  }

  keyForAttribute(attr) {
    return dasherize(attr);
  }

  typeKeyForModel(model) {
    return pluralize(model.type);
  }

  normalize(json) {
    return json;
  }

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

    delete attrs.id;

    model.fks.forEach(fk => {
      delete attrs[fk];
    });

    return this._formatAttributeKeys(attrs);
  }

  _formatAttributeKeys(attrs) {
    let formattedAttrs = {};

    for (let key in attrs) {
      let formattedKey = this.keyForAttribute(key);
      formattedAttrs[formattedKey] = attrs[key];
    }

    return formattedAttrs;
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
    return object instanceof Collection;
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

}

// Defaults
JsonApiSerializer.prototype.relationships = [];

JsonApiSerializer.extend = extend;

export default JsonApiSerializer;
