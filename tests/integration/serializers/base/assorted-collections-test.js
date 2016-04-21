import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import Serializer from 'ember-cli-mirage/serializer';
import schemaHelper from '../schema-helper';
import {module, test} from 'qunit';

module('Integration | Serializers | Base | Assorted Collections', {
  beforeEach() {
    this.schema = schemaHelper.setup();
    this.registry = new SerializerRegistry(this.schema, {
      greatPhoto: Serializer.extend({
        attrs: ['id', 'title']
      })
    });
    this.wordSmiths = [
      { id: '1', name: 'Link' },
      { id: '2', name: 'Zelda' },
      { id: '3', name: 'Epona' }
    ];
    this.greatPhotos = [
      { id: '1', title: 'Amazing', location: 'Hyrule' },
      { id: '2', title: 'greatPhoto', location: 'Goron City' }
    ];
    this.schema.db.loadData({
      wordSmiths: this.wordSmiths,
      greatPhotos: this.greatPhotos
    });
  },
  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`an array of assorted collections can be serialized`, function(assert) {
  let result = this.registry.serialize([this.schema.wordSmiths.all(), this.schema.greatPhotos.all()]);

  assert.deepEqual(result, {
    wordSmiths: this.wordSmiths,
    greatPhotos: this.greatPhotos.map((attrs) => {
      delete attrs.location;
      return attrs;
    })
  });
});
