import RouteRecognizer from "route-recognizer";

export default class RequestHandler {
  constructor(server) {
    this.server = server;
    this.routers = {
      GET: new RouteRecognizer(),
      POST: new RouteRecognizer(),
      PUT: new RouteRecognizer(),
      PATCH: new RouteRecognizer(),
      DELETE: new RouteRecognizer(),
      OPTIONS: new RouteRecognizer()
    };
    this.routers.delete = this.routers.del;
  }

  register(verb, path, handler) {
    let method = verb.toUpperCase();

    this.routers[method].add([{ path, handler }]);
  }

  get helpers() {
    return {
      GET: this.handle.bind(this, "GET"),
      POST: this.handle.bind(this, "POST"),
      PUT: this.handle.bind(this, "PUT"),
      PATCH: this.handle.bind(this, "PATCH"),
      DELETE: this.handle.bind(this, "DELETE"),
      DEL: this.handle.bind(this, "DELETE"),
      OPTIONS: this.handle.bind(this, "OPTIONS")
    };
  }

  routesFor(verb, url) {
    return this.routers[verb].recognize(url) || [];
  }

  canHandle(verb, url) {
    return this.routesFor(verb, url).length > 0;
  }

  async handle(verb, url) {
    let request = {
      url,
      method: verb.toUpperCase(),
      params: {},
      queryParams: {},
      requestBody: {},
      requestHeaders: {},
      async: true
    };
    let recognizedRoutes = this.routesFor(verb, url);

    if (recognizedRoutes) {
      let handler = recognizedRoutes[0].handler;

      return await handler(request);
    }
  }
}
