export default class ObjectRouteHandler {

  constructor(dbOrSchema, object) {
    this.dbOrSchema = dbOrSchema;
    this.object = object;
  }

  handle(request) {
    return this.object;
  }

}
