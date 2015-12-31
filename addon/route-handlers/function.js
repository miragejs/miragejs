export default class FunctionRouteHandler {

  constructor(schema, serializerOrRegistry, userFunction) {
    this.schema = schema;
    this.serializerOrRegistry = serializerOrRegistry;
    this.userFunction = userFunction;
  }

  handle(request) {
    return this.userFunction(this.schema, request);
  }

}
