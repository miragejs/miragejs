import Ember from 'ember';
import Response from './response';

const { isArray, keys } = _;
const { isBlank, typeOf } = Ember;
const defaultCodes = {
  get: 200,
  put: 204,
  post: 201,
  'delete': 204
};

export default class RouteHandler {

  constructor(verb, serializerOrRegistry, standardF, customizedCode) {
    this.verb = verb;
    this.serializerOrRegistry = serializerOrRegistry;
    this.standardF = standardF;
    this.customizedCode = customizedCode;
  }

  handle(dbOrSchema, request) {
    let response = this.standardF(dbOrSchema, request);
    let serializedResponse = this._serialize(response, request);

    return this._toRackResponse(serializedResponse);
  }

  _serialize(response, request) {
    let serializedResponse;

    if (response instanceof Response) {
      serializedResponse = response;
    } else {
      serializedResponse = this.serializerOrRegistry.serialize(response, request);
    }

    return serializedResponse;
  }

  _toRackResponse(response) {
    let rackResponse;

    if (response instanceof Response) {
      rackResponse = response.toArray();

    } else {
      rackResponse = this._assembleRackResponse(response);
    }

    return rackResponse;
  }

  _assembleRackResponse(response) {
    let rackResponse, code;

    if (this.customizedCode) {
      code = this.customizedCode;
    } else {
      code = defaultCodes[this.verb];
      let isEmptyObject = typeOf(response) === 'object' && keys(response).length === 0;
      if (code === 204 && response && !isEmptyObject && (isArray(response) || !isBlank(response))) {
        code = 200;
      }
    }

    if (response) {
      rackResponse = [code, {"Content-Type": "application/json"}, response];
    } else {
      rackResponse = [code, {}, undefined];
    }

    return rackResponse;
  }
}
