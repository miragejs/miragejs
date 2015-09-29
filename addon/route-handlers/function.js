export default class FunctionRouteHandler {

  constructor(dbOrSchema, serializerOrRegistry, userFunction) {
    this.dbOrSchema = dbOrSchema;
    this.serializerOrRegistry = serializerOrRegistry;
    this.userFunction = userFunction;
  }

  handle(request) {
    return this.userFunction(this.dbOrSchema, request);
  }

}
