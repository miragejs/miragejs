import {module, test} from 'qunit';
import PutShorthandRouteHandler from 'ember-cli-mirage/route-handlers/shorthands/put';
import Server from 'ember-cli-mirage/server';
import Model from 'ember-cli-mirage/orm/model';
import JSONAPISerializer from 'ember-cli-mirage/serializers/json-api-serializer';

module('Integration | Route Handlers | PUT shorthand', {

  beforeEach() {
    this.server = new Server({
      environment: 'development',
      models: {
        author: Model.extend()
      }
    });
    this.server.timing = 0;
    this.server.logging = false;

    this.authors = [
      { id: 1, firstName: 'Ganon' }
    ];
    this.server.db.loadData({
      authors: this.authors
    });

    this.schema = this.server.schema;
    this.serializer = new JSONAPISerializer();

    this.body = {
      data: {
        type: 'authors',
        id: '1',
        attributes: {
          'first-name': 'Ganondorf'
        }
      }
    };
  },
  afterEach() {
    this.server.shutdown();
  }

});

test('undefined shorthand updates the record and returns the model', function(assert) {
  let handler = new PutShorthandRouteHandler(this.schema, this.serializer, undefined, '/authors/:id');
  let request = { requestBody: JSON.stringify(this.body), url: '/authors/1', params: { id: '1' } };

  let model = handler.handle(request);

  assert.equal(this.schema.db.authors.length, 1);
  assert.ok(model instanceof Model);
  assert.equal(model.modelName, 'author');
  assert.equal(model.firstName, 'Ganondorf');
});

test('query params are ignored', function(assert) {
  let handler = new PutShorthandRouteHandler(this.schema, this.serializer, 'author');
  let request = { requestBody: JSON.stringify(this.body), url: '/authors/1?foo=bar', params: { id: '1' }, queryParams: { foo: 'bar' } };

  let model = handler.handle(request);

  assert.equal(this.schema.db.authors.length, 1);
  assert.ok(model instanceof Model);
  assert.equal(model.modelName, 'author');
  assert.equal(model.firstName, 'Ganondorf');
});

test('string shorthand updates the record of the specified type and returns the model', function(assert) {
  let handler = new PutShorthandRouteHandler(this.schema, this.serializer, undefined, '/authors/:id');
  let request = { requestBody: JSON.stringify(this.body), url: '/authors/1', params: { id: '1' } };

  let model = handler.handle(request);

  assert.equal(this.schema.db.authors.length, 1);
  assert.ok(model instanceof Model);
  assert.equal(model.modelName, 'author');
  assert.equal(model.firstName, 'Ganondorf');
});

test('if a shorthand tries to access an unknown type it throws an error', function(assert) {
  let handler = new PutShorthandRouteHandler(this.schema, this.serializer, undefined, '/foobars/:id');
  let request = { requestBody: JSON.stringify(this.body), url: '/foobars/1', params: { id: '1' } };

  assert.throws(function() {
    handler.handle(request);
  }, /model doesn't exist/);
  assert.ok(true);
});
