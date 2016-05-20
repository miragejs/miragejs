import Ember from 'ember';
import { MirageError } from 'ember-cli-mirage/assert';
import Response from './response';
import FunctionHandler from './route-handlers/function';
import ObjectHandler from './route-handlers/object';
import GetShorthandHandler from './route-handlers/shorthands/get';
import PostShorthandHandler from './route-handlers/shorthands/post';
import PutShorthandHandler from './route-handlers/shorthands/put';
import DeleteShorthandHandler from './route-handlers/shorthands/delete';
import HeadShorthandHandler from './route-handlers/shorthands/head';

import _keys from 'lodash/object/keys';
import _isArray from 'lodash/lang/isArray';

const { isBlank, typeOf } = Ember;

function isNotBlankResponse(response) {
  return response &&
    !(typeOf(response) === 'object' && _keys(response).length === 0) &&
    (_isArray(response) || !isBlank(response));
}

const DEFAULT_CODES = { get: 200, put: 204, post: 201, 'delete': 204 };

function createHandler({ verb, schema, serializerOrRegistry, path, rawHandler, options }) {
  let handler;
  let args = [ schema, serializerOrRegistry, rawHandler, path, options ];
  let type = typeOf(rawHandler);

  if (type === 'function') {
    handler = new FunctionHandler(...args);
  } else if (type === 'object') {
    handler = new ObjectHandler(...args);
  } else if (verb === 'get') {
    handler = new GetShorthandHandler(...args);
  } else if (verb === 'post') {
    handler = new PostShorthandHandler(...args);
  } else if (verb === 'put' || verb === 'patch') {
    handler = new PutShorthandHandler(...args);
  } else if (verb === 'delete') {
    handler = new DeleteShorthandHandler(...args);
  } else if (verb === 'head') {
    handler = new HeadShorthandHandler(...args);
  }
  return handler;
}

export default class RouteHandler {

  constructor({ schema, verb, rawHandler, customizedCode, options, path, serializerOrRegistry }) {
    this.verb = verb;
    this.customizedCode = customizedCode;
    this.serializerOrRegistry = serializerOrRegistry;
    this.handler = createHandler({ verb, schema, path, serializerOrRegistry, rawHandler, options });
  }

  handle(request) {
    let mirageResponse = this._getMirageResponseForRequest(request);
    let serializedMirageResponse = this.serialize(mirageResponse, request);

    return serializedMirageResponse.toRackResponse();
  }

  _getMirageResponseForRequest(request) {
    let response;
    try {
      /*
       We need to do this for the #serialize convenience method. Probably is
       a better way.
     */
      if (this.handler instanceof FunctionHandler) {
        this.handler.setRequest(request);
      }

      response = this.handler.handle(request);
    } catch(e) {
      if (e instanceof MirageError) {
        throw e;
      } else {
        let message = (typeOf(e) === 'string') ? e : e.message;
        throw new MirageError(`Your handler for the url ${request.url} threw an error: ${message}`);
      }
    }

    return this._toMirageResponse(response);
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
    if (this.customizedCode) {
      code = this.customizedCode;
    } else {
      code = DEFAULT_CODES[this.verb];
      if (code === 204 && isNotBlankResponse(response)) {
        code = 200;
      }
    }
    return code;
  }

  serialize(mirageResponse, request) {
    mirageResponse.data = this.serializerOrRegistry.serialize(mirageResponse.data, request);
    return mirageResponse;
  }
}
