import assert from 'ember-cli-mirage/assert';
import { camelize, singularize, dasherize } from 'ember-cli-mirage/utils/inflector';
import HasMany from '../orm/associations/has-many';

const PATH_VAR_REGEXP = /^:/;

/**
  @hide
*/
export default class BaseRouteHandler {

  getModelClassFromPath(fullPath) {
    if (!fullPath) {
      return;
    }
    let path = fullPath.split('/');
    let lastPath;
    while (path.length > 0) {
      lastPath = path.splice(-1)[0];
      if (lastPath && !PATH_VAR_REGEXP.test(lastPath)) {
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
      json.data && (json.data.attributes || json.data.type || json.data.relationships),
      `You're using a shorthand or #normalizedRequestAttrs, but your serializer's normalize function did not return a valid JSON:API document. http://www.ember-cli-mirage.com/docs/v0.3.x/serializers/#normalizejson`
    );

    if (json.data.attributes) {
      attrs = Object.keys(json.data.attributes).reduce((sum, key) => {
        sum[camelize(key)] = json.data.attributes[key];
        return sum;
      }, {});
    }

    if (json.data.relationships) {
      Object.keys(json.data.relationships).forEach((relationshipName) => {
        let relationship = json.data.relationships[relationshipName];
        let modelClass = this.schema.modelClassFor(modelName);
        let association = modelClass.associationFor(camelize(relationshipName));
        let valueForRelationship;

        assert(
          association,
          `You're passing the relationship '${relationshipName}' to the '${modelName}' model via a ${request.method} to '${request.url}', but you did not define the '${relationshipName}' association on the '${modelName}' model. http://www.ember-cli-mirage.com/docs/v0.4.x/models/#associations`
        );

        if (association.isPolymorphic) {
          valueForRelationship = relationship.data;

        } else if (association instanceof HasMany) {
          valueForRelationship = relationship.data && relationship.data.map(rel => rel.id);

        } else {
          valueForRelationship = relationship.data && relationship.data.id;
        }

        attrs[association.identifier] = valueForRelationship;
      }, {});
    }

    if (id) {
      attrs.id = id;
    }

    return attrs;
  }

  _getAttrsForFormRequest({ requestBody }) {
    let attrs;
    let urlEncodedParts = [];

    assert(
      requestBody && typeof requestBody === 'string',
      `You're using the helper method #normalizedFormData, but the request body is empty or not a valid url encoded string.`
    );

    urlEncodedParts = requestBody.split('&');

    attrs = urlEncodedParts.reduce((a, urlEncodedPart) => {
      let [key, value] = urlEncodedPart.split('=');
      a[key] = decodeURIComponent(value.replace(/\+/g,  ' '));
      return a;
    }, {});

    return attrs;
  }
}
