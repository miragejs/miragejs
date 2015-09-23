import {module, test} from 'qunit';
import Server from 'ember-cli-mirage/server';
import Model from 'ember-cli-mirage/orm/model';
import put from 'ember-cli-mirage/shorthands/put';

module('Unit | Shorthands | put with orm', {
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
      {id: 1, name: 'Ganon'},
    ];
    this.server.db.loadData({
      authors: this.authors
    });

    this.schema = this.server.schema;
  },
  afterEach: function() {
    this.server.shutdown();
  }
});

test('undefined shorthand updates the record and returns the model', function(assert) {
  let body = '{"author":{"id":"1","name":"Ganondorf"}}';
  let model = put.undefined(undefined, this.schema, {requestBody: body, url: '/authors/1', params: {id: '1'}});

  assert.equal(this.schema.db.authors.length, 1);
  assert.ok(model instanceof Model);
  assert.equal(model.type, 'author');
  assert.equal(model.name, 'Ganondorf');
});

test('query params are ignored', function(assert) {
  let body = '{"author":{"id":"1","name":"Ganondorf"}}';
  let model = put.undefined(undefined, this.schema, {requestBody: body, url: '/authors/1?foo=bar', params: {id: '1'}, queryParams: {foo: 'bar'}});

  assert.equal(this.schema.db.authors.length, 1);
  assert.ok(model instanceof Model);
  assert.equal(model.type, 'author');
  assert.equal(model.name, 'Ganondorf');
});

test('string shorthand updates the record of the specified type and returns the model', function(assert) {
  let body = '{"author":{"id":"1","name":"Ganondorf"}}';
  let model = put.string('author', this.schema, {requestBody: body, url: '/people/1', params: {id: '1'}});

  assert.equal(this.schema.db.authors.length, 1);
  assert.ok(model instanceof Model);
  assert.equal(model.type, 'author');
  assert.equal(model.name, 'Ganondorf');
});
