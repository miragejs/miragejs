import BaseRouteHandler from './base';
import assert from 'ember-cli-mirage/assert';

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

  normalizedRequestAttrs(modelName = null) {
    let {
      path,
      request,
      request: { requestHeaders }
    } = this;
    let attrs;

    if (/x-www-form-urlencoded/.test(requestHeaders['Content-Type'])) {
      attrs = this._getAttrsForFormRequest(request);
    } else {
      modelName = modelName || this.getModelClassFromPath(path);

      assert(
        this.schema.modelFor(modelName),
        `You're using a shorthand or the #normalizedRequestAttrs helper but the detected model of '${modelName}' does not exist. You might need to pass in the correct modelName as the first argument to #normalizedRequestAttrs.`
      );

      attrs = this._getAttrsForRequest(request, modelName);
    }

    return attrs;
  }
}
