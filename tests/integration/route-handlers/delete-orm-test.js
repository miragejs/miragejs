import {module, test} from 'qunit';
import Server from 'ember-cli-mirage/server';
import Model from 'ember-cli-mirage/orm/model';
import Mirage from 'ember-cli-mirage';
import DeleteShorthandRouteHandler from 'ember-cli-mirage/route-handlers/shorthands/delete';
import JSONAPISerializer from 'ember-cli-mirage/serializers/json-api-serializer';

module('Integration | Route Handlers | DELETE with ORM', {

  beforeEach: function() {
    this.server = new Server({
      environment: 'development',
      models: {
        author: Model.extend({
          posts: Mirage.hasMany(),
        }),
        post: Model
      }
    });
    this.server.timing = 0;
    this.server.logging = false;

    let authors = [
      {id: 1, name: 'Ganon'},
    ];
    let posts = [
      {id: 1, title: 'Lorem', authorId: '1'},
      {id: 2, title: 'Another', authorId: '2'},
    ];
    this.server.db.loadData({authors, posts});

    this.schema = this.server.schema;
    this.serializer = new JSONAPISerializer();
  },

  afterEach: function() {
    this.server.shutdown();
  }

});

test('undefined shorthand deletes the record and returns null', function(assert) {
  let request = {url: '/authors/1', params: {id: '1'}};
  let handler = new DeleteShorthandRouteHandler(this.schema, this.serializer);

  let response = handler.handle(request);

  assert.equal(this.schema.db.authors.length, 0);
  assert.equal(response, null);
});

test('query params are ignored', function(assert) {
  let request = {url: '/authors/1?foo=bar', params: {id: '1'}, queryParams: {foo: 'bar'}};
  let handler = new DeleteShorthandRouteHandler(this.schema, this.serializer);

  let response = handler.handle(request);

  assert.equal(this.schema.db.authors.length, 0);
  assert.equal(response, null);
});

test('string shorthand deletes the record of the specified type', function(assert) {
  let request = {url: '/people/1?foo=bar', params: {id: '1'}, queryParams: {foo: 'bar'}};
  let handler = new DeleteShorthandRouteHandler(this.schema, this.serializer, 'author');

  let response = handler.handle(request);

  assert.equal(this.schema.db.authors.length, 0);
  assert.equal(response, null);
});

test('array shorthand deletes the record and all related records', function(assert) {
  let request = {url: '/authors/1', params: {id: '1'}};
  let handler = new DeleteShorthandRouteHandler(this.schema, this.serializer, ['author', 'posts']);

  let response = handler.handle(request);

  assert.equal(this.schema.db.authors.length, 0);
  assert.equal(this.schema.db.posts.length, 1);
  assert.equal(response, null);
});
