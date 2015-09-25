import {module, test} from 'qunit';
import PostShorthandRouteHandler from 'ember-cli-mirage/route-handlers/shorthands/post';
import Server from 'ember-cli-mirage/server';
import Model from 'ember-cli-mirage/orm/model';
import ActiveModelSerializer from 'ember-cli-mirage/serializers/active-model-serializer';

module('Integration | Route Handlers | POST with ORM', {
  beforeEach: function() {
    this.server = new Server({
      environment: 'development',
      models: {
        author: Model.extend({})
      },
      serializers: {
        application: ActiveModelSerializer
      }
    });
    this.server.timing = 0;
    this.server.logging = false;
    this.schema = this.server.schema;
  },
  afterEach: function() {
    this.server.shutdown();
  }
});

test('undefined shorthand creates a record and returns the new model', function(assert) {
  let body = {author: {first_name: "Ganon", last_name: "Dorf"}};
  let request = {requestBody: JSON.stringify(body), url: '/authors'};
  let handler = new PostShorthandRouteHandler(this.schema);

  let model = handler.handle(request);

  assert.equal(this.schema.db.authors.length, 1);
  assert.ok(model instanceof Model);
  assert.equal(model.type, 'author');
  assert.equal(model.first_name, 'Ganon');
});

test('string shorthand creates a record of the specified type and returns the new model', function(assert) {
  let body = {author: {first_name: "Ganon", last_name: "Dorf"}};
  let request = {requestBody: JSON.stringify(body), url: '/people'};
  let handler = new PostShorthandRouteHandler(this.schema, 'author');

  let model = handler.handle(request);

  assert.equal(this.schema.db.authors.length, 1);
  assert.ok(model instanceof Model);
  assert.equal(model.type, 'author');
  assert.equal(model.first_name, 'Ganon');
});

test('query params are ignored', function(assert) {
  let body = {author: {first_name: "Ganon", last_name: "Dorf"}};
  let request = {requestBody: JSON.stringify(body), url: '/authors?foo=bar', queryParams: {foo: 'bar'}};
  let handler = new PostShorthandRouteHandler(this.schema);

  let model = handler.handle(request);

  assert.equal(this.schema.db.authors.length, 1);
  assert.ok(model instanceof Model);
  assert.equal(model.type, 'author');
  assert.equal(model.first_name, 'Ganon');
});

