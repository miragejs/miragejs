import Ember from 'ember';
import MirageError from 'ember-cli-mirage/error';
import Response from './response';
import FunctionHandler from './route-handlers/function';
import ObjectHandler from './route-handlers/object';
import GetShorthandHandler from './route-handlers/shorthands/get';
import PostShorthandHandler from './route-handlers/shorthands/post';
import PutShorthandHandler from './route-handlers/shorthands/put';
import DeleteShorthandHandler from './route-handlers/shorthands/delete';

import _keys from 'lodash/object/keys';
import _isArray from 'lodash/lang/isArray';

const { isBlank, typeOf } = Ember;

function isNotBlankResponse(response) {
  return response &&
    !(typeOf(response) === 'object' && _keys(response).length === 0) &&
    (_isArray(response) || !isBlank(response));
}

const DEFAULT_CODES = { get: 200, put: 204, post: 201, 'delete': 204 };

function createHandler({ verb, schema, serializerOrRegistry, rawHandler, options }) {
  let handler;
  let args = [ schema, serializerOrRegistry, rawHandler, options ];
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
  }
  return handler;
}

/*
  Args can be of the form
    [options]
    [object, code]
    [function, code]
    [shorthand, options]
    [shorthand, code, options]
    with all optional. This method returns an array of
    [handler (i.e. the function, object or shorthand), code, options].
*/
function extractArguments(args) {
  var argsLength = args.length;
  var lastArgument = args[argsLength - 1];
  var t = argsLength;
  if (lastArgument && lastArgument.hasOwnProperty('coalesce')) {
    t--;
  } else {
    args.push({ colesce: false });
  }
  for (var i = 0; i < 4 - args.length; i++) {
    args.splice(t, 0, undefined);
  }
  return args;
}

export default class RouteHandler {

  constructor(schema, verb, args, serializerOrRegistry) {
    let [rawHandler, customizedCode, options] = extractArguments(args);
    this.verb = verb;
    this.customizedCode = customizedCode;
    this.serializerOrRegistry = serializerOrRegistry;
    this.handler = createHandler({ verb, schema, serializerOrRegistry, rawHandler, options });
  }

  handle(request) {
    let mirageResponse = this._getMirageResponseForRequest(request);
    let serializedMirageResponse = this._serialize(mirageResponse, request);

    return serializedMirageResponse.toRackResponse();
  }

  _getMirageResponseForRequest(request) {
    let response;
    try {
      response = this.handler.handle(request);
    } catch(e) {
      if (e instanceof MirageError) {
        throw e;
      } else {
        throw new MirageError(`Your handler for the url ${request.url} threw an error: ${e.message}`);
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

  _serialize(mirageResponse, request) {
    mirageResponse.data = this.serializerOrRegistry.serialize(mirageResponse.data, request);
    return mirageResponse;
  }
}
