import { module, test } from 'qunit';
import { Model, hasMany, Serializer } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';

module('Integration | Serializers | Base | Associations | Polymorphic | Top level', function(hooks) {

  hooks.beforeEach(function() {
    this.server = new Server({
      models: {
        user: Model.extend({
          things: hasMany({ polymorphic: true })
        }),
        picture: Model.extend(),
        car: Model.extend()
      }
    });
    this.user = this.server.create('user', {
      things: [
        this.server.create('picture', { title: 'Picture 1'}),
        this.server.create('car', { name: 'Car 1' })
      ]
    });

  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test(`it can serialize a polymorphic collection when root is false`, function(assert) {
    this.server.config({
      serializers: {
        application: Serializer.extend({
          root: false,
          embed: true
        })
      }
    });
    let json = this.server.serializerOrRegistry.serialize(this.user.things);

    assert.deepEqual(json, [
      {
        "id": "1",
        "title": "Picture 1"
      },
      {
        "id": "1",
        "name": "Car 1"
      }
    ]);
  });

  test(`it throws if trying to serialize a polymorphic collection when root is true`, function(assert) {
    this.server.config({
      serializers: {
        application: Serializer.extend({
          root: true
        })
      }
    });

    assert.throws(() => {
      this.server.serializerOrRegistry.serialize(this.user.things);
    }, /The base Serializer class cannot serialize a top-level PolymorphicCollection when root is true/);
  });

});
