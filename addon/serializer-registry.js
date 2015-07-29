import Model from 'ember-cli-mirage/orm/model';
import Collection from 'ember-cli-mirage/orm/collection';
import Serializer from 'ember-cli-mirage/serializer';

export default class SerializerRegistry {

  constructor(schema, serializerMap = {}) {
    this.schema = schema;
    this.baseSerializer = new Serializer();
    this._serializerMap = serializerMap;
  }

  serialize(response) {
    if (response instanceof Model && this._serializerFor(response)) {
      let SerializerClass = this._serializerFor(response);
      let serializer = new SerializerClass();

      return serializer.serialize(response);

    } else if (response instanceof Collection && this._serializerFor(response[0])) {
      let SerializerClass = this._serializerFor(response[0]);
      let serializer = new SerializerClass();

      return serializer.serialize(response);

    } else {
      return this.baseSerializer.serialize(response);
    }
  }

  _serializerFor(model) {
    return this._serializerMap[model.type] || undefined;
  }

}
