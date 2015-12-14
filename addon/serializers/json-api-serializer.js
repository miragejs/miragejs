import extend from '../utils/extend';
import { dasherize, pluralize, camelize } from '../utils/inflector';
import Model from 'ember-cli-mirage/orm/model';
import Collection from 'ember-cli-mirage/orm/collection';
import _assign from 'lodash/object/assign';
import _get from 'lodash/object/get';
import _compose from 'lodash/function/compose';
import _trim from 'lodash/string/trim';

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
      data: this._resourceObjectFor(model, request)
    };

    this._serializeRelationshipsFor(model, request);

    return response;
  }

  _serializePrimaryCollection(collection, request) {
    let response = {
      data: collection.map(model => this._resourceObjectFor(model, request))
    };

    collection.forEach(model => {
      this._serializeRelationshipsFor(model, request);
    });

    return response;
  }

  _serializeRelationshipsFor(model, request) {
    let serializer = this._serializerFor(model);

    const relationships = this._combineRelationships(serializer, request);

    relationships.forEach(type => {
      let relationship = model[camelize(type)];

      if (relationship instanceof Model) {
        this._serializeIncludedModel(relationship, request);
      } else if (relationship) {
        relationship.forEach(model => {
          this._serializeIncludedModel(model, request);
        });
      }
    });
  }

  _serializeIncludedModel(model, request) {
    if (this._hasBeenSerialized(model)) {
      return;
    }
    this._augmentAlreadySerialized(model);

    this.included.push(this._resourceObjectFor(model, request));
    this._serializeRelationshipsFor(model, request);
  }

  _resourceObjectFor(model, request) {
    const attrs = this._attrsForModel(model);

    const obj = {
      type: this.typeKeyForModel(model),
      id: model.id,
      attributes: attrs
    };

    model.associationKeys.forEach(camelizedType => {
      const relationship = model[camelizedType];
      const dasherizedType = dasherize(camelizedType);

      if (this._isCollection(relationship)) {
        if (!obj.relationships) { obj.relationships = {}; }
        obj.relationships[dasherizedType] = {
          data: relationship.map(model => {
            return {
              type: this.typeKeyForModel(model),
              id: model.id
            };
          })
        };
      } else if (relationship) {
        if (!obj.relationships) { obj.relationships = {}; }
        obj.relationships[dasherizedType] = {
          data: {
            type: this.typeKeyForModel(relationship),
            id: relationship.id
          }
        };
      }
    });

    return obj;
  }

  keyForAttribute(attr) {
    return dasherize(attr);
  }

  typeKeyForModel(model) {
    return _compose(pluralize, dasherize)(model.type);
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

  _combineRelationships(serializer = {}, request = {}) {
    const serializerRelationships = _get(serializer, 'include', []);
    let requestRelationships = _get(request, 'queryParams.include', []);

    if (requestRelationships.length) {
      requestRelationships = requestRelationships.split(',').map(_trim);
    }

    return [...serializerRelationships, ...requestRelationships];
  }

}

// Defaults
JsonApiSerializer.prototype.relationships = [];

JsonApiSerializer.extend = extend;

export default JsonApiSerializer;
