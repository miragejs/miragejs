import { module, skip } from 'qunit';
import { Collection, Model, hasMany, belongsTo, JSONAPISerializer } from 'ember-cli-mirage';
import Db from 'ember-cli-mirage/db';
import Schema from 'ember-cli-mirage/orm/schema';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';

module('Integration | Serializers | JSON API Serializer | Associations | Many To Many', {
  beforeEach() {
    let db = new Db();

    let schema = new Schema(db, {
      contact: Model.extend({
        addresses: hasMany(),
        contactAddresses: hasMany()
      }),
      address: Model.extend({
        contacts: hasMany(),
        contactAddresses: hasMany()
      }),
      contactAddress: Model.extend({
        contact: belongsTo(),
        address: belongsTo()
      })
    });

    let mario = schema.contacts.create({ name: 'Mario' });
    let newYork = schema.addresses.create({ street: 'Some New York Street' });
    let mushroomKingdom = schema.addresses.create({ street: 'Some Mushroom Kingdom Street' });

    schema.contactAddresses.create({ contact: mario, address: newYork });
    schema.contactAddresses.create({ contact: mario, address: mushroomKingdom });

    this.schema = schema;
  }
});

skip(`it serializes manyToMany if properly configured to passthrough `, function(assert) {
  let contactSerializer = JSONAPISerializer.extend({
    addresses(model) {
      let models = model.contactAddresses.models.map(ca => ca.address);
      return new Collection('address', models);
    }
  });

  let addressSerializer = JSONAPISerializer.extend({
    contacts(model) {
      let models = model.contactAddresses.models.map(ca => ca.contact);
      return new Collection('contact', models);
    }
  });

  let registry = new SerializerRegistry(this.schema, {
    address: addressSerializer,
    contact: contactSerializer
  });

  let contact = this.schema.contacts.find(1);
  let result = registry.serialize(contact);

  assert.deepEqual(result, {
    data: {
      id: '1',
      type: 'contacts',
      attributes: {
        name: 'Mario'
      },
      relationships: {
        addresses: {
          data: [
            { id: '1', type: 'addresses' },
            { id: '2', type: 'addresses' }
          ]
        },
        'contact-addresses': {
          data: [
            { id: '1', type: 'contact-addresses' },
            { id: '2', type: 'contact-addresses' }
          ]
        }
      }
    }
  });
});

skip(`it sideloads manyToMany if properly configured to passthrough and include`, function(assert) {
  let contactSerializer = JSONAPISerializer.extend({
    include: ['addresses'],
    addresses(model) {
      let models = model.contactAddresses.models.map(ca => ca.address);
      return new Collection('address', models);
    }
  });

  let addressSerializer = JSONAPISerializer.extend({
    include: ['contacts'],
    contacts(model) {
      let models = model.contactAddresses.models.map(ca => ca.contact);
      return new Collection('contact', models);
    }
  });

  let registry = new SerializerRegistry(this.schema, {
    address: addressSerializer,
    contact: contactSerializer
  });

  let contact = this.schema.contacts.find(1);
  let result = registry.serialize(contact);

  let { data, included } = result;

  assert.deepEqual(data, {
    id: '1',
    type: 'contacts',
    attributes: {
      name: 'Mario'
    },
    relationships: {
      addresses: {
        data: [
          { id: '1', type: 'addresses' },
          { id: '2', type: 'addresses' }
        ]
      },
      'contact-addresses': {
        data: [
          { id: '1', type: 'contact-addresses' },
          { id: '2', type: 'contact-addresses' }
        ]
      }
    }
  });

  assert.deepEqual(included, [{
    id: '1',
    type: 'addresses',
    attributes: {
      street: 'Some New York Street'
    },
    relationships: {
      contacts: { data: [{ id: '1', type: 'contacts' }] },
      'contact-addresses': { data: [{ id: '1', type: 'contact-addresses' }] }
    }
  }, {
    id: '2',
    type: 'addresses',
    attributes: {
      street: 'Some Mushroom Kingdom Street'
    },
    relationships: {
      contacts: { data: [{ id: '1', type: 'contacts' }] },
      'contact-addresses': { data: [{ id: '2', type: 'contact-addresses' }] }
    }
  }]);
});
