import { singularize, capitalize, camelize, dasherize } from 'ember-cli-mirage/utils/inflector';
import _isArray from 'lodash/lang/isArray';

const allDigitsRegex = /^\d+$/;

export default class BaseShorthandRouteHandler {

  constructor(dbOrSchema, serializerOrRegistry, shorthand, options) {
    this.dbOrSchema = dbOrSchema;
    this.serializerOrRegistry = serializerOrRegistry;
    this.shorthand = shorthand;
    this.options = options;
  }

  handle(request) {
    let type = _isArray(this.shorthand) ? 'array' : typeof this.shorthand;
    let typeHandler = `handle${capitalize(type)}Shorthand`;

    return this[typeHandler](this.shorthand, this.dbOrSchema, request, this.options);
  }

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
    let url;

    if (request && request.url) {
      url = request.url;
    }

    return url;
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

  _getAttrsForRequest(request) {
    let id = this._getIdForRequest(request);
    let json = this._getJsonBodyForRequest(request);
    let jsonApiDoc = this.serializerOrRegistry.normalize(json);
    let attrs = {};
    Object.keys(jsonApiDoc.data.attributes).forEach(key => {
      attrs[camelize(key)] = jsonApiDoc.data.attributes[key];
    });

    attrs.id = id;

    return attrs;
  }

  handleUndefinedShorthand(undef, dbOrSchema, request, options) {
    let id = this._getIdForRequest(request);
    let url = this._getUrlForRequest(request);
    let modelName = this._getModelNameFromUrl(url, id);

    return this.handleStringShorthand(modelName, dbOrSchema, request, options);
  }

}
