import BaseRouteHandler from './base';

export default class FunctionRouteHandler extends BaseRouteHandler {

  constructor(schema, serializerOrRegistry, userFunction, path) {
    super();
    this.schema = schema;
    this.serializerOrRegistry = serializerOrRegistry;
    this.userFunction = userFunction;
    this.path = path;
  }

  handle(request) {
    return this.userFunction(this.schema, request);
  }

  setRequest(request) {
    this.request = request;
  }

  serialize(response, serializerType) {
    let serializer;

    if (serializerType) {
      serializer = this.serializerOrRegistry.serializerFor(serializerType, { explicit: true });
    } else {
      serializer = this.serializerOrRegistry;
    }

    return serializer.serialize(response, this.request);
  }

  normalizedRequestAttrs() {
    let {
      path,
      request,
      request: { requestHeaders }
    } = this;

    let modelName = this.getModelClassFromPath(path);

    if (/x-www-form-urlencoded/.test(requestHeaders['Content-Type'])) {
      return this._getAttrsForFormRequest(request);
    } else {
      return this._getAttrsForRequest(request, modelName);
    }
  }
}
