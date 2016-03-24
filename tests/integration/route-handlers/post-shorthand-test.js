import {module, test} from 'qunit';
import Server from 'ember-cli-mirage/server';
import Model from 'ember-cli-mirage/orm/model';
import PostShorthandRouteHandler from 'ember-cli-mirage/route-handlers/shorthands/post';
import JSONAPISerializer from 'ember-cli-mirage/serializers/json-api-serializer';

module('Integration | Route Handlers | POST shorthand', {
  beforeEach() {
    this.server = new Server({
      environment: 'development',
      models: {
        author: Model.extend({})
      }
    });
    this.server.timing = 0;
    this.server.logging = false;
    this.schema = this.server.schema;

    this.serializer = new JSONAPISerializer();

    this.body = {
      data: {
        type: 'authors',
        attributes: {
          'first-name': 'Ganon',
          'last-name': 'Dorf'
        }
      }
    };
  },
  afterEach() {
    this.server.shutdown();
  }
});

test('string shorthand creates a record of the specified type and returns the new model', function(assert) {
  let request = { requestBody: JSON.stringify(this.body), url: '/people' };
  let handler = new PostShorthandRouteHandler(this.schema, this.serializer, 'author');

  let model = handler.handle(request);

  assert.equal(this.schema.db.authors.length, 1);
  assert.ok(model instanceof Model);
  assert.equal(model.modelName, 'author');
  assert.equal(model.firstName, 'Ganon');
});

test('query params are ignored', function(assert) {
  let request = { requestBody: JSON.stringify(this.body), url: '/authors?foo=bar', queryParams: { foo: 'bar' } };
  let handler = new PostShorthandRouteHandler(this.schema, this.serializer, 'author');

  let model = handler.handle(request);

  assert.equal(this.schema.db.authors.length, 1);
  assert.ok(model instanceof Model);
  assert.equal(model.modelName, 'author');
  assert.equal(model.firstName, 'Ganon');
});

test('undefined shorthand creates a record and returns the new model', function(assert) {
  let request = { requestBody: JSON.stringify(this.body), url: '/authors' };
  let handler = new PostShorthandRouteHandler(this.schema, this.serializer, null, '/authors');

  let model = handler.handle(request);

  assert.equal(this.schema.db.authors.length, 1);
  assert.ok(model instanceof Model);
  assert.equal(model.modelName, 'author');
  assert.equal(model.firstName, 'Ganon');
});

test('if a shorthand tries to access an unknown type it throws an error', function(assert) {
  let request = { requestBody: JSON.stringify(this.body), url: '/foobars' };
  let handler = new PostShorthandRouteHandler(this.schema, this.serializer, 'foobar');

  assert.throws(function() {
    handler.handle(request);
  }, /model doesn't exist/);
  assert.ok(true);
});
