export default class RouteHandler {

  constructor(server, verb, options) {
    this.server = server;

    var args = this._extractStubArguments(options);
    this.registerHandler(verb, ...args);
  }

  registerHandler(verb, path, handler, code, options) {
    let server = this.server;
    path = path[0] === '/' ? path.slice(1) : path;

    server.interceptor[verb].call(server.interceptor, this._getFullPath(path), function(request) {
      var response = server.controller.handle(verb, handler, (server.schema || server.db), request, code, options);
      var shouldLog = typeof server.logging !== 'undefined' ? server.logging : (server.environment !== 'test');

      if (shouldLog) {
        console.log('Successful request: ' + verb.toUpperCase() + ' ' + request.url);
        console.log(response[2]);
      }

      return response;
    }, function() { return server.timing; });
  }

  /*
    Given a variable number of arguments, it generates an array of with
    [path, handler, code, options], `path` and `options` being always defined,
    and `handler` and `code` being undefined if not suplied.
  */
  _extractStubArguments(ary) {
    var argsInitialLength = ary.length;
    var lastArgument = ary[ary.length - 1];
    var options;
    var i = 0;
    if (lastArgument.constructor === Object) {
      argsInitialLength--;
    } else {
      options = { colesce: false };
      ary.push(options);
    }
    for(; i < 5 - ary.length; i++) {
      ary.splice(argsInitialLength, 0, undefined);
    }
    return ary;
  }

  /*
    Builds a full path for Pretender to monitor based on the `path` and
    configured options (`urlPrefix` and `namespace`).
  */
  _getFullPath(path) {
    let fullPath = '';
    let urlPrefix = this.server.urlPrefix ? this.server.urlPrefix.trim() : '';
    let namespace = this.server.namespace ? this.server.namespace.trim() : '';

    // check to see if path is a FQDN. if so, ignore any urlPrefix/namespace that was set
    if (/^https?:\/\//.test(path)) {
      fullPath += path;
    } else {

      // otherwise, if there is a urlPrefix, use that as the beginning of the path
      if (!!urlPrefix.length) {
        fullPath += urlPrefix[urlPrefix.length - 1] === '/' ? urlPrefix : urlPrefix + '/';
      }

      // if a namespace has been configured, add it before the path
      if (!!namespace.length) {
        fullPath += namespace ? namespace + '/' : namespace;
      }

      // finally add the configured path
      fullPath += path;
    }

    return fullPath;
  }
}
