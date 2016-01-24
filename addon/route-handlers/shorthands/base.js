import { singularize, camelize, dasherize } from 'ember-cli-mirage/utils/inflector';
import _isArray from 'lodash/lang/isArray';
import assert from 'ember-cli-mirage/assert';

const allDigitsRegex = /^\d+$/;

export default class BaseShorthandRouteHandler {

  constructor(schema, serializerOrRegistry, shorthand, options={}) {
    this.schema = schema;
    this.serializerOrRegistry = serializerOrRegistry;
    this.shorthand = shorthand;
    this.options = options;

    let type = _isArray(this.shorthand) ? 'array' : typeof this.shorthand;
    let handler;
    if (type === 'undefined') {
      handler = this.handleUndefinedShorthand;
    } else if (type === 'string') {
      handler = this.handleStringShorthand;
    } else if (type === 'array') {
      handler = this.handleArrayShorthand;
    }

    this.handler = handler;
  }

  handle(request) {
    return this.handler(request, this.shorthand);
  }

  handleUndefinedShorthand(request) {
    let id = this._getIdForRequest(request);
    let url = this._getUrlForRequest(request);
    let modelName = this._getModelNameFromUrl(url, id);

    return this.handleStringShorthand(request, modelName);
  }

  handleStringShorthand() { }
  handleArrayShorthand() { }

  _getIdForRequest(request) {
    let id;

    if (request && request.params && request.params.id) {
      id = request.params.id;
      // If parses, coerce to integer
      if (typeof id === "string" && allDigitsRegex.test(id)) {
        id = parseInt(request.params.id, 10);
      }
    }

    return id;
  }

  _getUrlForRequest(request) {
    return request && request.url;
  }

  _getModelNameFromUrl(url, hasId) {
    let [ urlSplit ] = url.split('?');
    let path = urlSplit.split('/');
    path = path[path.length - 1] === '' ? path.slice(0, path.length - 1) : path; // when trailing slash
    let typePath = hasId ? path[path.length - 2] : path[path.length - 1];
    let modelName = dasherize(camelize(singularize(typePath)));

    return modelName;
  }

  _getJsonBodyForRequest(request) {
    let body;

    if (request && request.requestBody) {
      body = JSON.parse(request.requestBody);
    }

    return body;
  }

  _getAttrsForRequest(request, modelName) {
    let id = this._getIdForRequest(request);
    let json = this._getJsonBodyForRequest(request);
    let jsonApiDoc = this.serializerOrRegistry.normalize(json, modelName);

    assert(
      jsonApiDoc.data && jsonApiDoc.data.attributes,
      `You're using a shorthand but your serializer's normalize function did not return a valid JSON:API document. http://www.ember-cli-mirage.com/docs/v0.2.x/serializers/#normalizejson`
    );

    let attrs = {};
    Object.keys(jsonApiDoc.data.attributes).forEach(key => {
      attrs[camelize(key)] = jsonApiDoc.data.attributes[key];
    });

    attrs.id = id;

    return attrs;
  }


}
