import { module, skip } from 'qunit';
import { Collection, Model, hasMany, belongsTo, Serializer } from 'ember-cli-mirage';
import Db from 'ember-cli-mirage/db';
import Schema from 'ember-cli-mirage/orm/schema';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';

module('Integration | Serializers | Base | Associations | Many To Many', {
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

    let registry = new SerializerRegistry(schema, {
      contact: Serializer.extend({
        include: ['addresses'],
        addresses(model) {
          let models = model.contactAddresses.models.map(ca => ca.address);
          return new Collection('address', models);
        }
      }),
      address: Serializer.extend({
        include: ['contacts'],
        contacts(model) {
          let models = model.contactAddresses.models.map(ca => ca.contact);
          return new Collection('contact', models);
        }
      })
    });

    let mario = schema.contacts.create({ name: 'Mario' });
    let newYork = schema.addresses.create({ street: 'Some New York Street' });
    let mushroomKingdom = schema.addresses.create({ street: 'Some Mushroom Kingdom Street' });

    schema.contactAddresses.create({ contact: mario, address: newYork });
    schema.contactAddresses.create({ contact: mario, address: mushroomKingdom });

    this.schema = schema;
    this.registry = registry;
  }
});

skip(`it serializes manyToMany if properly configured to passthrough`, function(assert) {
  let contact = this.schema.contacts.find(1);
  let result = this.registry.serialize(contact);

  assert.deepEqual(result, {
    addresses: [{
      contactId: null, // side-effect of having a HasMany on the contactAddress side of things
      contactIds: ['1'],
      id: '1',
      street: 'Some New York Street'
    }, {
      contactId: null,
      contactIds: ['1'],
      id: '2',
      street: 'Some Mushroom Kingdom Street'
    }],
    contact: {
      addressId: null, // side-effect of having a HasMany on the contactAddress side of things
      addressIds: ['1', '2'],
      id: '1',
      name: 'Mario'
    }
  });
});
