// jscs:disable requireParenthesesAroundArrowParam
import Serializer from '../serializer';
import { dasherize, pluralize, singularize } from '../utils/inflector';
import extend from './../utils/extend';

import _flatten from 'lodash/array/flatten';
import _get from 'lodash/object/get';
import _trim from 'lodash/string/trim';
import _isString from 'lodash/lang/isString';

class JsonApiSerializer extends Serializer {

  serialize(modelOrCollection, request={}) {
    let response;

    if (this.isModel(modelOrCollection)) {
      response = this._serializeModel(modelOrCollection, request);
    } else {
      response = this._serializeCollection(modelOrCollection, request);
    }

    if (this.included.length) {
      response.included = this.included;
    }

    return response;
  }

  keyForAttribute(attr) {
    return dasherize(attr);
  }

  keyForRelationship(key) {
    return dasherize(key);
  }

  keyForRelationshipIds(modelName) {
    return `${singularize(modelName)}Ids`;
  }

  typeKeyForModel(model) {
    return dasherize(pluralize(model.modelName));
  }

  toString() {
    return `serializer:${this.type}`;
  }

  _serializeModel(model, request) {
    this._augmentAlreadySerialized(model);

    let response = {
      data: this._resourceObjectFor(model, request)
    };

    this._serializeRelationshipsFor(model, request);

    return response;
  }

  _serializeCollection(collection, request) {
    let response = {
      data: collection.models.map(model => this._resourceObjectFor(model, request))
    };

    collection.models.forEach(model => {
      this._serializeRelationshipsFor(model, request);
    });

    return response;
  }

  _serializeIncludedModel(model, request) {
    if (this._hasBeenSerialized(model)) {
      return;
    }
    this._augmentAlreadySerialized(model);

    this.included.push(this._resourceObjectFor(model, request));
    this._serializeRelationshipsFor(model, request);
  }

  _serializeForeignKey(key) {
    return dasherize(key);
  }

  _resourceObjectFor(model, _request) {
    let attrs = this._attrsForModel(model, _request, true, false);

    let obj = {
      type: this.typeKeyForModel(model),
      id: model.id,
      attributes: attrs
    };

    let linkData = this._linkDataFor(model);

    model.associationKeys.forEach(camelizedType => {
      let relationship = this._getRelatedValue(model, camelizedType);
      let relationshipKey = this.keyForRelationship(camelizedType);

      if (!obj.relationships) {
        obj.relationships = {};
      }

      if (this.isCollection(relationship)) {
        obj.relationships[relationshipKey] = {
          data: relationship.models.map(model => {
            return {
              type: this.typeKeyForModel(model),
              id: model.id
            };
          })
        };
      } else if (relationship) {
        obj.relationships[relationshipKey] = {
          data: {
            type: this.typeKeyForModel(relationship),
            id: relationship.id
          }
        };
      } else {
        obj.relationships[relationshipKey] = {
          data: null
        };
      }

      if (linkData && linkData[camelizedType]) {
        this._addLinkData(obj, relationshipKey, linkData[camelizedType]);
      }
    });

    return obj;
  }

  _attrsForModel(model, _request = null, removeForeignKeys = true) {
    let attrs = super._attrsForModel(model, _request, removeForeignKeys);
    delete attrs.id;
    return attrs;
  }

  _linkDataFor(model) {
    let serializer = this.serializerFor(model.modelName);
    let linkData   = null;
    if (serializer && serializer.links) {
      linkData = serializer.links(model);
    }
    return linkData;
  }

  _addLinkData(json, relationshipKey, linkData) {
    if (!json.relationships[relationshipKey]) {
      json.relationships[relationshipKey] = {};
    }

    delete json.relationships[relationshipKey].data;
    json.relationships[relationshipKey].links = {};

    if (linkData.self) {
      json.relationships[relationshipKey].links.self = { href: linkData.self };
    }

    if (linkData.related) {
      json.relationships[relationshipKey].links.related = { href: linkData.related };
    }
  }

  _getRelationshipNames(request = {}) {
    let requestRelationships = _get(request, 'queryParams.include');
    let relationships;

    if (_isString(requestRelationships)) {
      relationships = requestRelationships;
    } else {
      relationships = _get(this, 'include', []).join(',');
    }

    if (relationships.length) {
      let expandedRelationships = relationships
        .split(',')
        .map(_trim)
        .map((r) => r.split('.').map((_, index, elements) => elements.slice(0, index + 1).join('.')));

      return _flatten(expandedRelationships);
    }
    return [];
  }
}

JsonApiSerializer.extend = extend;

export default JsonApiSerializer;
