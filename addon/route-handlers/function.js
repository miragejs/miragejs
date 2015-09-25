export default class FunctionRouteHandler {

  constructor(dbOrSchema, userFunction) {
    this.dbOrSchema = dbOrSchema;
    this.userFunction = userFunction;
  }

  handle(request) {
    return this.userFunction(this.dbOrSchema, request);
  }

}
