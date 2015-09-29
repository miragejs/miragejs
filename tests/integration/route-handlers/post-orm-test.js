import {module, test} from 'qunit';
import Server from 'ember-cli-mirage/server';
import Model from 'ember-cli-mirage/orm/model';
import PostShorthandRouteHandler from 'ember-cli-mirage/route-handlers/shorthands/post';
import JSONAPISerializer from 'ember-cli-mirage/serializers/json-api-serializer';

module('Integration | Route Handlers | POST with ORM', {
  beforeEach: function() {
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
          'last-name': 'Dorf',
        }
      }
    };
  },
  afterEach: function() {
    this.server.shutdown();
  }
});

test('undefined shorthand creates a record and returns the new model', function(assert) {
  let request = {requestBody: JSON.stringify(this.body), url: '/authors'};
  let handler = new PostShorthandRouteHandler(this.schema, this.serializer);

  let model = handler.handle(request);

  assert.equal(this.schema.db.authors.length, 1);
  assert.ok(model instanceof Model);
  assert.equal(model.type, 'author');
  assert.equal(model.firstName, 'Ganon');
});

test('string shorthand creates a record of the specified type and returns the new model', function(assert) {
  let request = {requestBody: JSON.stringify(this.body), url: '/people'};
  let handler = new PostShorthandRouteHandler(this.schema, this.serializer, 'author');

  let model = handler.handle(request);

  assert.equal(this.schema.db.authors.length, 1);
  assert.ok(model instanceof Model);
  assert.equal(model.type, 'author');
  assert.equal(model.firstName, 'Ganon');
});

test('query params are ignored', function(assert) {
  let request = {requestBody: JSON.stringify(this.body), url: '/authors?foo=bar', queryParams: {foo: 'bar'}};
  let handler = new PostShorthandRouteHandler(this.schema, this.serializer);

  let model = handler.handle(request);

  assert.equal(this.schema.db.authors.length, 1);
  assert.ok(model instanceof Model);
  assert.equal(model.type, 'author');
  assert.equal(model.firstName, 'Ganon');
});
