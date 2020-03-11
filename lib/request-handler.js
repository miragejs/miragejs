import RouteRecognizer from "route-recognizer";
import urlParse from "url-parse";

const defaultOrigin = Symbol();

/**
  A class for storing and looking up information about route handlers registered with Mirage.

  @class RequestHandler
  @private
*/
export default class RequestHandler {
  constructor(server) {
    this.server = server;
    this.originRoutes = {};
  }

  /** 
    A single group of route recognizers won't work because route recognizer has no concept of an origin. So we're going to use this function to group all of the recognizers by their origin.

    @private
  */
  recognizersFor(url) {
    let { origin } = urlParse(url);
    let key = origin || defaultOrigin;

    if (!this.originRoutes[key]) {
      let routes = {
        GET: new RouteRecognizer(),
        POST: new RouteRecognizer(),
        PUT: new RouteRecognizer(),
        PATCH: new RouteRecognizer(),
        DELETE: new RouteRecognizer(),
        OPTIONS: new RouteRecognizer()
      };
      routes.delete = routes.del;
      this.originRoutes[key] = routes;
    }

    return this.originRoutes[key];
  }

  /**
    The recognizer for the given verb and url

    @private
  */
  recognizerFor(verb, url) {
    let recognizers = this.recognizersFor(url);
    let method = verb.toUpperCase();
    return recognizers[method];
  }

  /**
    Adds a route handler.

    @param {string} verb The HTTP verb to handle
    @param {string} url The URL to attach the handler to
    @param {handler} function The handler
   
    @public
  */
  register(verb, url, handler) {
    let { pathname } = urlParse(url);
    this.recognizerFor(verb, url).add([{ path: pathname, handler }]);
  }

  /**
    @private
  */
  routesFor(verb, url) {
    let method = verb.toUpperCase();
    let recognizer = this.recognizerFor(method, url);
    let { pathname } = urlParse(url);
    return recognizer.recognize(pathname) || [];
  }

  /**
    Checks whether or not the verb and url can be handled by one of the registered handlers
    
    @return {boolean} Is the verb/url registered
    @public
  */
  canHandle(verb, url) {
    return this.routesFor(verb, url).length > 0;
  }
}
