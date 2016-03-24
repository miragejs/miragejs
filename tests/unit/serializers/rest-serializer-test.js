import RestSerializer from 'ember-cli-mirage/serializers/rest-serializer';

import {module, test} from 'qunit';

module('Unit | Serializers | RestSerializer', {
  beforeEach() {
    this.serializer = new RestSerializer();
  }
});

test('it hyphenates camelized words', function(assert) {
  let payload = {
    'person': {
      'id': 1,
      'firstName': 'Rick',
      'lastName': 'Sanchez'
    }
  };
  let jsonApiDoc = this.serializer.normalize(payload);

  assert.deepEqual(jsonApiDoc, {
    data: {
      type: 'people',
      id: 1,
      attributes: {
        'first-name': 'Rick',
        'last-name': 'Sanchez'
      }
    }
  });
});
