import shorthandHandlers from 'ember-cli-mirage/shorthands/index';
import Response from './response';
import Ember from 'ember';

const { isArray, keys } = _;
const { isBlank, typeOf } = Ember;
const defaultCodes = {
  get: 200,
  put: 204,
  post: 201,
  'delete': 204
};

export default class RouteDefinitionReader {

  constructor(verb, args) {
    let [rawHandler, customizedCode, options] = this._extractArguments(args);
    this.verb = verb;
    this.rawHandler = rawHandler;
    this.customizedCode = customizedCode;
    this.options = options;
  }

  /*
    Returns a standard function for this route definition with the followign signature:

      function(dbOrSchema, request) {
        ...return Mirage.Response
      }
  */
  handler() {
    let type = typeof this.rawHandler;
    type = isArray(this.rawHandler) ? 'array' : type;

    let handler;

    if (type === 'function' || type === 'object') {
      handler = this['_' + type + 'Handler']();
    } else {
      handler = this._shorthandHandler(type);
    }

    return handler;
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

  _functionHandler() {
    let userFunction = this.rawHandler;

    return (dbOrSchema, request) => {
      let response;

      try {
        response = userFunction(dbOrSchema, request);
      } catch(error) {
        console.error('Mirage: Your custom function handler for the url ' + request.url + ' threw an error:', error.message, error.stack);
      }

      return this._toMirageResponse(response);
    };
  }

  _objectHandler() {
    let object = this.rawHandler;

    return (dbOrSchema, request) => {
      return this._toMirageResponse(object);
    };
  }

  _shorthandHandler(type) {
    let shorthandArg = this.rawHandler;
    let shorthandF = shorthandHandlers[this.verb][type];

    return (dbOrSchema, request) => {
      let response = shorthandF(shorthandArg, dbOrSchema, request, this.options);

      return this._toMirageResponse(response);
    };
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
      code = defaultCodes[this.verb];

      if (code === 204 && responseHasContent) {
        code = 200;
      }
    }

    return code;
  }

}
