import { Model, hasMany } from 'ember-cli-mirage';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import Serializer from 'ember-cli-mirage/serializer';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import { module, test } from 'qunit';

module('Integration | Serializers | Base | Associations | Polymorphic | Has Many', function(hooks) {
  hooks.beforeEach(function() {
    this.schema = new Schema(new Db(), {
      user: Model.extend({
        things: hasMany({ polymorphic: true })
      }),
      picture: Model.extend()
    });

    let post = this.schema.pictures.create({ title: 'Lorem ipsum' });
    this.schema.users.create({ things: [ post ], name: 'Ned' });
  });

  hooks.afterEach(function() {
    this.schema.db.emptyData();
  });

  test(`it can serialize a polymorphic has-many relationship when serializeIds is set to included`, function(assert) {
    let BaseSerializer = Serializer.extend({
      embed: false,
      serializeIds: 'included'
    });
    let registry = new SerializerRegistry(this.schema, {
      application: BaseSerializer,
      user: BaseSerializer.extend({
        serializeIds: 'included',
        include: ['things']
      })
    });

    let user = this.schema.users.find(1);
    let result = registry.serialize(user);

    assert.deepEqual(result, {
      user: {
        id: '1',
        name: 'Ned',
        thingIds: [
          { id: '1', type: 'picture' }
        ]
      },
      pictures: [
        { id: '1', title: 'Lorem ipsum' }
      ]
    });
  });

  test(`it can serialize a polymorphic has-many relationship when serializeIds is set to always`, function(assert) {
    let BaseSerializer = Serializer.extend({
      embed: false,
      serializeIds: 'always'
    });
    let registry = new SerializerRegistry(this.schema, {
      application: BaseSerializer,
      user: BaseSerializer
    });

    let user = this.schema.users.find(1);
    let result = registry.serialize(user);

    assert.deepEqual(result, {
      user: {
        id: '1',
        name: 'Ned',
        thingIds: [
          { id: '1', type: 'picture' }
        ]
      }
    });
  });

  test(`it can serialize an embedded polymorphic has-many relationship`, function(assert) {
    let BaseSerializer = Serializer.extend({
      embed: true,
      serializeIds: 'included'
    });
    let registry = new SerializerRegistry(this.schema, {
      application: BaseSerializer,
      user: BaseSerializer.extend({
        include: ['things']
      })
    });

    let user = this.schema.users.find(1);
    let result = registry.serialize(user);

    assert.deepEqual(result, {
      user: {
        id: '1',
        name: 'Ned',
        things: [
          {
            id: '1',
            title: 'Lorem ipsum'
          }
        ]
      }
    });
  });
});
