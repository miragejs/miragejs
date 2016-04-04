// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
import ActiveModelSerializer from 'ember-cli-mirage/serializers/active-model-serializer';

import {module, test} from 'qunit';

module('Unit | Serializers | ActiveModelSerializer', {
  beforeEach() {
    this.serializer = new ActiveModelSerializer();
  }
});

test('normalize works', function(assert) {
  let payload = {
    contact: {
      id: 1,
      name: 'Link'
    }
  };
  let jsonApiDoc = this.serializer.normalize(payload);

  assert.deepEqual(jsonApiDoc, {
    data: {
      type: 'contacts',
      id: 1,
      attributes: {
        name: 'Link'
      }
    }
  });
});

test('it hyphenates snake_cased words', function(assert) {
  let payload = {
    contact: {
      id: 1,
      first_name: 'Link'
    }
  };
  let jsonApiDoc = this.serializer.normalize(payload);

  assert.deepEqual(jsonApiDoc, {
    data: {
      type: 'contacts',
      id: 1,
      attributes: {
        'first-name': 'Link'
      }
    }
  });
});

test('it works without an id', function(assert) {
  let payload = {
    contact: {
      first_name: 'Link',
      last_name: 'zor'
    }
  };
  let jsonApiDoc = this.serializer.normalize(payload);

  assert.deepEqual(jsonApiDoc, {
    data: {
      type: 'contacts',
      attributes: {
        'first-name': 'Link',
        'last-name': 'zor'
      }
    }
  });
});

