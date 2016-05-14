import { module, test } from 'qunit';
import { Model, Factory, ActiveModelSerializer } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';

module('Integration | Server | Custom function handler', {
  beforeEach() {
    this.server = new Server({
      environment: 'test',
      models: {
        contact: Model
      },
      factories: {
        contact: Factory
      },
      serializers: {
        application: ActiveModelSerializer
      }
    });
    this.server.timing = 0;
    this.server.logging = false;
  },
  afterEach() {
    this.server.shutdown();
  }
});

test(`a POJA of models defaults to responding with an array of each model's attrs`, function(assert) {
  assert.expect(1);
  let done = assert.async();
  let { server } = this;

  server.createList('contact', 3);
  server.get('/contacts', (schema, request) => {
    return schema.contacts.all().models;
  });

  $.ajax({
    method: 'GET',
    url: '/contacts'
  }).done((res, status, xhr) => {
    assert.deepEqual(res, [{ id: '1' }, { id: '2' }, { id: '3' }]);
    done();
  });
});

test(`#normalizedRequestAttrs returns the an object with the primary resource's attrs and belongsTo keys camelized`, function(assert) {
  assert.expect(1);
  let done = assert.async();
  let { server } = this;

  server.post('/contacts', function(schema, request) {
    let attrs = this.normalizedRequestAttrs();

    assert.deepEqual(attrs, {
      firstName: 'Sam',
      lastName: 'Selikoff',
      teamId: 1
    });

    return {};
  });

  $.ajax({
    method: 'POST',
    url: '/contacts',
    data: JSON.stringify({
      contact: {
        first_name: 'Sam',
        last_name: 'Selikoff',
        team_id: 1
      }
    })
  }).done(() => {
    done();
  });
});
