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

const { RSVP: { Promise }, isBlank, typeOf } = Ember;

function isNotBlankResponse(response) {
  return response &&
    !(typeOf(response) === 'object' && Object.keys(response).length === 0) &&
    (Array.isArray(response) || !isBlank(response));
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
    return new Promise(resolve => {
      this._getMirageResponseForRequest(request).then(mirageResponse => {
        this.serialize(mirageResponse, request).then(serializedMirageResponse => {
          resolve(serializedMirageResponse.toRackResponse());
        });
      });
    });
  }

  _getMirageResponseForRequest(request) {
    let result;
    try {
      /*
       We need to do this for the #serialize convenience method. Probably is
       a better way.
     */
      if (this.handler instanceof FunctionHandler) {
        this.handler.setRequest(request);
      }

      result = this.handler.handle(request);
    } catch(e) {
      if (e instanceof MirageError) {
        throw e;
      } else {
        let message = (typeOf(e) === 'string') ? e : e.message;
        throw new MirageError(`Your handler for the url ${request.url} threw an error: ${message}`);
      }
    }

    return this._toMirageResponse(result);
  }

  _toMirageResponse(result) {
    let mirageResponse;

    return new Promise(resolve => {
      Promise.resolve(result).then(response => {
        if (response instanceof Response) {
          mirageResponse = result;
        } else {
          let code = this._getCodeForResponse(response);
          mirageResponse = new Response(code, {}, response);
        }
        resolve(mirageResponse);
      });

    });
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

  serialize(mirageResponsePromise, request) {
    return new Promise(resolve => {
      Promise.resolve(mirageResponsePromise).then(mirageResponse => {
        mirageResponse.data = this.serializerOrRegistry.serialize(mirageResponse.data, request);
        resolve(mirageResponse);
      });
    });
  }
}
