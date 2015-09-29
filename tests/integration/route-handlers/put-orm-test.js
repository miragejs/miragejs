import {module, test} from 'qunit';
import PutShorthandRouteHandler from 'ember-cli-mirage/route-handlers/shorthands/put';
import Server from 'ember-cli-mirage/server';
import Model from 'ember-cli-mirage/orm/model';
import JSONAPISerializer from 'ember-cli-mirage/serializers/json-api-serializer';

module('Integration | Route Handlers | PUT with ORM', {

  beforeEach: function() {
    this.server = new Server({
      environment: 'development',
      models: {
        author: Model.extend(),
      }
    });
    this.server.timing = 0;
    this.server.logging = false;

    this.authors = [
      {id: 1, firstName: 'Ganon'},
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
  afterEach: function() {
    this.server.shutdown();
  }

});

test('undefined shorthand updates the record and returns the model', function(assert) {
  let handler = new PutShorthandRouteHandler(this.schema, this.serializer);
  let request = {requestBody: JSON.stringify(this.body), url: '/authors/1', params: {id: '1'}};

  let model = handler.handle(request);

  assert.equal(this.schema.db.authors.length, 1);
  assert.ok(model instanceof Model);
  assert.equal(model.type, 'author');
  assert.equal(model.firstName, 'Ganondorf');
});

test('query params are ignored', function(assert) {
  let handler = new PutShorthandRouteHandler(this.schema, this.serializer);
  let request = {requestBody: JSON.stringify(this.body), url: '/authors/1?foo=bar', params: {id: '1'}, queryParams: {foo: 'bar'}};

  let model = handler.handle(request);

  assert.equal(this.schema.db.authors.length, 1);
  assert.ok(model instanceof Model);
  assert.equal(model.type, 'author');
  assert.equal(model.firstName, 'Ganondorf');
});

test('string shorthand updates the record of the specified type and returns the model', function(assert) {
  let handler = new PutShorthandRouteHandler(this.schema, this.serializer, 'author');
  let request = {requestBody: JSON.stringify(this.body), url: '/people/1', params: {id: '1'}};

  let model = handler.handle(request);

  assert.equal(this.schema.db.authors.length, 1);
  assert.ok(model instanceof Model);
  assert.equal(model.type, 'author');
  assert.equal(model.firstName, 'Ganondorf');
});
