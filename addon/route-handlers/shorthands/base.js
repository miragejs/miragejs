import { singularize, capitalize } from 'ember-cli-mirage/utils/inflector';

const { isArray } = _;
const allDigitsRegex = /^\d+$/;

export default class BaseShorthandRouteHandler {

  constructor(dbOrSchema, shorthand, options) {
    this.dbOrSchema = dbOrSchema;
    this.shorthand = shorthand;
    this.options = options;
  }

  handle(request) {
    let type = isArray(this.shorthand) ? 'array' : typeof this.shorthand;
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

  _getTypeFromUrl(url, hasId) {
    let urlNoId = hasId ? url.substr(0, url.lastIndexOf('/')) : url;
    let urlSplit = urlNoId.split("?");
    let urlNoIdNoQuery = urlSplit[0].slice(-1) === '/' ? urlSplit[0].slice(0, -1) : urlSplit[0];
    let type = singularize(urlNoIdNoQuery.substr(urlNoIdNoQuery.lastIndexOf('/') + 1));

    return type;
  }

  _getJsonBodyForRequest(request) {
    let body;

    if (request && request.requestBody) {
      body = JSON.parse(request.requestBody);
    }

    return body;
  }

}
