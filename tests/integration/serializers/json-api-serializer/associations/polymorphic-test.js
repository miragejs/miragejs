import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import { Model, belongsTo, hasMany, JSONAPISerializer } from 'ember-cli-mirage';
import { module, test } from 'qunit';

module('Integration | Serializers | JSON API Serializer | Associations | Polymorphic');

test('it works for belongs to polymorphic relationships', function(assert) {
  let schema = new Schema(new Db(), {
    photo: Model.extend(),
    video: Model.extend(),
    comment: Model.extend({
      commentable: belongsTo({ polymorphic: true })
    })
  });

  let registry = new SerializerRegistry(this.schema, {
    application: JSONAPISerializer
  });
  let photo = schema.photos.create({ title: 'Foo' });
  schema.comments.create({ text: 'Pretty foo!', commentable: photo });

  let video = schema.videos.create({ title: 'Bar' });
  schema.comments.create({ text: 'Love the bar!', commentable: video });

  let result = registry.serialize(schema.comments.all());
  assert.deepEqual(result, {
    data: [
      {
        "attributes": {
          "text": "Pretty foo!"
        },
        "id": "1",
        "relationships": {
          "commentable": {
            "data": { id: '1', type: 'photos' }
          }
        },
        "type": "comments"
      },
      {
        "attributes": {
          "text": "Love the bar!"
        },
        "id": "2",
        "relationships": {
          "commentable": {
            "data": { id: '1', type: 'videos' }
          }
        },
        "type": "comments"
      }
    ]
  });
});

test('it works for has many polymorphic relationships', function(assert) {
  let schema = new Schema(new Db(), {
    user: Model.extend({
      things: hasMany({ polymorphic: true })
    }),
    car: Model.extend(),
    watch: Model.extend()
  });

  let registry = new SerializerRegistry(this.schema, {
    application: JSONAPISerializer
  });

  let car = schema.cars.create({ make: 'Infiniti' });
  let watch = schema.watches.create({ make: 'Citizen' });
  let user = schema.users.create({
    name: 'Sam',
    things: [ car, watch ]
  });

  let json = registry.serialize(user);

  assert.deepEqual(json, {
    data: {
      "attributes": {
        "name": "Sam"
      },
      "id": "1",
      "relationships": {
        "things": {
          "data": [
            { id: '1', type: 'cars' },
            { id: '1', type: 'watches' }
          ]
        }
      },
      "type": "users"
    }
  });
});
