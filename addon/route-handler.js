export default class RouteHandler {

  constructor(serializerOrRegistry, standardF) {
    this.serializerOrRegistry = serializerOrRegistry;
    this.standardF = standardF;
  }

  handle(dbOrSchema, request) {
    let mirageResponse = this.standardF(dbOrSchema, request);
    let serializedMirageResponse = this._serialize(mirageResponse, request);

    return serializedMirageResponse.toRackResponse();
  }

  _serialize(mirageResponse, request) {
    mirageResponse.data = this.serializerOrRegistry.serialize(mirageResponse.data, request);

    return mirageResponse;
  }
}
