import shorthandHandlers from 'ember-cli-mirage/shorthands/index';

const { isArray } = _;

export default class RouteDefinitionReader {

  constructor(serializerOrRegistry) {
    this.serializerOrRegistry = serializerOrRegistry;
  }

  read(verb, args) {
    let [rawHandler, customizedCode, options] = this._extractStubArguments(args);
    let handler = this._lookupHandlerMethod(verb, rawHandler, options);

    return {handler, customizedCode};
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
  _extractStubArguments(ary) {
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

  _lookupHandlerMethod(verb, handler, options) {
    let type = typeof handler;
    type = isArray(handler) ? 'array' : type;

    let handlerMethod;

    if (type === 'function' || type === 'object') {
      handlerMethod = this['_' + type + 'Handler'](handler);
    } else {
      handlerMethod = this._shorthandHandler(verb, type, handler, options);
    }

    return handlerMethod;
  }

  _functionHandler(userFunction) {
    return function(dbOrSchema, request) {
      let data;

      try {
        data = userFunction(dbOrSchema, request);
      } catch(error) {
        console.error('Mirage: Your custom function handler for the url ' + request.url + ' threw an error:', error.message, error.stack);
      }

      return data;
    };
  }

  _objectHandler(object) {
    return function(dbOrSchema, request) {
      return object;
    };
  }

  _shorthandHandler(verb, type, handler, options) {
    let shorthandF = shorthandHandlers[verb][type];

    return function(dbOrSchema, request) {
      return shorthandF(handler, dbOrSchema, request, options);
    };
  }

}
