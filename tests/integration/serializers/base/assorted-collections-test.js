import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import Serializer from 'ember-cli-mirage/serializer';
import schemaHelper from '../schema-helper';
import {module, test} from 'qunit';

module('Integration | Serializers | Base | Assorted Collections', {
  beforeEach() {
    this.schema = schemaHelper.setup();
    this.registry = new SerializerRegistry(this.schema, {
      photo: Serializer.extend({
        attrs: ['id', 'title']
      })
    });
    this.authors = [
      {id: 1, name: 'Link'},
      {id: 2, name: 'Zelda'},
      {id: 3, name: 'Epona'}
    ];
    this.photos = [
      {id: 1, title: 'Amazing', location: 'Hyrule'},
      {id: 2, title: 'Photo', location: 'Goron City'}
    ];
    this.schema.db.loadData({
      authors: this.authors,
      photos: this.photos,
    });
  },
  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`an array of assorted collections can be serialized`, function(assert) {
  let result = this.registry.serialize([this.schema.author.all(), this.schema.photo.all()]);

  assert.deepEqual(result, {
    authors: this.authors,
    photos: this.photos.map(attrs => { delete attrs.location; return attrs; })
  });
});
