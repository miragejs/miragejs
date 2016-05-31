import _isArray from 'lodash/lang/isArray';
import assert from 'ember-cli-mirage/assert';
import { camelize, singularize, dasherize } from 'ember-cli-mirage/utils/inflector';

export default class BaseRouteHandler {

  getModelClassFromPath(fullPath) {
    if (!fullPath) {
      return;
    }
    let path = fullPath.split('/');
    let lastPath;
    while (path.length > 0) {
      lastPath = path.splice(-1)[0];
      if (lastPath && lastPath !== ':id') {
        break;
      }
    }
    let modelName = dasherize(camelize(singularize(lastPath)));
    return modelName;
  }

  _getIdForRequest(request, jsonApiDoc) {
    let id;
    if (request && request.params && request.params.id) {
      id = request.params.id;
    } else if (jsonApiDoc && jsonApiDoc.data && jsonApiDoc.data.id) {
      id = jsonApiDoc.data.id;
    }
    return id;
  }

  _getJsonApiDocForRequest(request, modelName) {
    let body;
    if (request && request.requestBody) {
      body = JSON.parse(request.requestBody);
    }
    return this.serializerOrRegistry.normalize(body, modelName);
  }

  _getAttrsForRequest(request, modelName) {
    let json = this._getJsonApiDocForRequest(request, modelName);
    let id = this._getIdForRequest(request, json);
    let attrs = {};

    assert(
      json.data && (json.data.attributes || json.data.relationships),
      `You're using a shorthand or #normalizedRequestAttrs, but your serializer's normalize function did not return a valid JSON:API document. http://www.ember-cli-mirage.com/docs/v0.2.x/serializers/#normalizejson`
    );

    if (json.data.attributes) {
      attrs = Object.keys(json.data.attributes).reduce((sum, key) => {
        sum[camelize(key)] = json.data.attributes[key];
        return sum;
      }, {});
    }

    if (json.data.relationships) {
      Object.keys(json.data.relationships).forEach((key) => {
        let relationship = json.data.relationships[key];

        if (!_isArray(relationship.data)) {
          attrs[`${camelize(key)}Id`] = relationship.data && relationship.data.id;
        }
      }, {});
    }

    if (id) {
      attrs.id = id;
    }

    return attrs;
  }

}
