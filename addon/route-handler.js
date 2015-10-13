import Ember from 'ember';
import Response from './response';
import FunctionHandler from './route-handlers/function';
import ObjectHandler from './route-handlers/object';
import GetShorthandHandler from './route-handlers/shorthands/get';
import PostShorthandHandler from './route-handlers/shorthands/post';
import PutShorthandHandler from './route-handlers/shorthands/put';
import DeleteShorthandHandler from './route-handlers/shorthands/delete';

const { isArray, keys } = _;
const { isBlank, typeOf } = Ember;

export default class RouteHandler {

  constructor(dbOrSchema, verb, args, serializerOrRegistry) {
    let [rawHandler, customizedCode, options] = this._extractArguments(args);

    this.dbOrSchema = dbOrSchema;
    this.serializerOrRegistry = serializerOrRegistry;
    this.verb = verb;
    this.rawHandler = rawHandler;
    this.customizedCode = customizedCode;
    this.options = options;
  }

  handle(request) {
    let mirageResponse = this._getMirageResponseForRequest(request);
    let serializedMirageResponse = this._serialize(mirageResponse, request);

    return serializedMirageResponse.toRackResponse();
  }

  _getMirageResponseForRequest(request) {
    let type = this._rawHandlerType();
    let handler;

    if (type === 'function') {
      handler = new FunctionHandler(this.dbOrSchema, this.serializerOrRegistry, this.rawHandler);

    } else if (type === 'object') {
      handler = new ObjectHandler(this.dbOrSchema, this.serializerOrRegistry, this.rawHandler);

    } else if (this.verb === 'get') {
      handler = new GetShorthandHandler(this.dbOrSchema, this.serializerOrRegistry, this.rawHandler, this.options);

    } else if (this.verb === 'post') {
      handler = new PostShorthandHandler(this.dbOrSchema, this.serializerOrRegistry, this.rawHandler, this.options);

    } else if (this.verb === 'put') {
      handler = new PutShorthandHandler(this.dbOrSchema, this.serializerOrRegistry, this.rawHandler, this.options);

    } else if (this.verb === 'delete') {
      handler = new DeleteShorthandHandler(this.dbOrSchema, this.serializerOrRegistry, this.rawHandler, this.options);
    }

    let response;

    try {
      response = handler.handle(request);
    } catch(error) {
      console.error('Mirage: Your handler for the url ' + request.url + ' threw an error:', error.message, error.stack);
    }

    return this._toMirageResponse(response);
  }

  /*
    Args can be of the form
      [function, code]
      [object, code]
      [shorthand, code, options]
      [shorthand, options]
      [options]
    with all optional. This method returns an array of
      [handler (i.e. the function, object or shorthand), code, options].
  */
  _extractArguments(ary) {
    var argsInitialLength = ary.length;
    var lastArgument = ary && ary[ary.length - 1];
    var options;
    var i = 0;
    if (lastArgument && lastArgument.hasOwnProperty('coalesce')) {
      argsInitialLength--;
    } else {
      options = { colesce: false };
      ary.push(options);
    }
    for(; i < 4 - ary.length; i++) {
      ary.splice(argsInitialLength, 0, undefined);
    }
    return ary;
  }

  _rawHandlerType() {
    return isArray(this.rawHandler) ? 'array' : typeof this.rawHandler;
  }

  _toMirageResponse(response) {
    let mirageResponse;

    if (response instanceof Response) {
      mirageResponse = response;
    } else {
      let code = this._getCodeForResponse(response);
      mirageResponse = new Response(code, {}, response);
    }

    return mirageResponse;
  }

  _getCodeForResponse(response) {
    let code;
    let responseIsEmptyObject = typeOf(response) === 'object' && keys(response).length === 0;
    let responseHasContent = response && !responseIsEmptyObject && (isArray(response) || !isBlank(response));

    if (this.customizedCode) {
      code = this.customizedCode;
    } else {
      code = this._defaultCodeFor[this.verb];

      if (code === 204 && responseHasContent) {
        code = 200;
      }
    }

    return code;
  }

  _defaultCodeFor(verb) {
    return {get: 200, put: 204, post: 201, 'delete': 204 }[verb];
  }

  _serialize(mirageResponse, request) {
    mirageResponse.data = this.serializerOrRegistry.serialize(mirageResponse.data, request);

    return mirageResponse;
  }
}
