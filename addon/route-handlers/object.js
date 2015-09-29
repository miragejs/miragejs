export default class ObjectRouteHandler {

  constructor(dbOrSchema, serializerOrRegistry, object) {
    this.dbOrSchema = dbOrSchema;
    this.serializerOrRegistry = serializerOrRegistry;
    this.object = object;
  }

  handle(request) {
    return this.object;
  }

}
