import {module, test} from 'qunit';
import Server from 'ember-cli-mirage/server';
import Model from 'ember-cli-mirage/orm/model';
import Mirage from 'ember-cli-mirage';
import DeleteShorthandRouteHandler from 'ember-cli-mirage/route-handlers/shorthands/delete';
import JSONAPISerializer from 'ember-cli-mirage/serializers/json-api-serializer';

module('Integration | Route Handlers | DELETE shorthand', {

  beforeEach() {
    this.server = new Server({
      environment: 'development',
      models: {
        wordSmith: Model.extend({
          blogPosts: Mirage.hasMany()
        }),
        blogPost: Model
      }
    });
    this.server.timing = 0;
    this.server.logging = false;

    let wordSmiths = [
      { id: 1, name: 'Ganon' }
    ];
    let blogPosts = [
      { id: 1, title: 'Lorem', wordSmithId: '1' },
      { id: 2, title: 'Another', wordSmithId: '2' }
    ];
    this.server.db.loadData({ wordSmiths, blogPosts });

    this.schema = this.server.schema;
    this.serializer = new JSONAPISerializer();
  },

  afterEach() {
    this.server.shutdown();
  }

});

test('undefined shorthand deletes the record and returns null', function(assert) {
  let request = { url: '/word-smiths/1', params: { id: '1' } };
  let handler = new DeleteShorthandRouteHandler(this.schema, this.serializer, undefined, '/word-smiths/:id');

  let response = handler.handle(request);

  assert.equal(this.schema.db.wordSmiths.length, 0);
  assert.equal(response, null);
});

test('query params are ignored', function(assert) {
  let request = { url: '/word-smiths/1?foo=bar', params: { id: '1' }, queryParams: { foo: 'bar' } };
  let handler = new DeleteShorthandRouteHandler(this.schema, this.serializer, undefined, '/word-smiths/:id');

  let response = handler.handle(request);

  assert.equal(this.schema.db.wordSmiths.length, 0);
  assert.equal(response, null);
});

test('string shorthand deletes the record of the specified type', function(assert) {
  let request = { url: '/word-smiths/1?foo=bar', params: { id: '1' }, queryParams: { foo: 'bar' } };
  let handler = new DeleteShorthandRouteHandler(this.schema, this.serializer, undefined, '/word-smiths/:id');

  let response = handler.handle(request);

  assert.equal(this.schema.db.wordSmiths.length, 0);
  assert.equal(response, null);
});

test('array shorthand deletes the record and all related records', function(assert) {
  let request = { url: '/word-smiths/1', params: { id: '1' } };
  let handler = new DeleteShorthandRouteHandler(this.schema, this.serializer, ['word-smith', 'blog-post']);

  let response = handler.handle(request);

  assert.equal(this.schema.db.wordSmiths.length, 0);
  assert.equal(this.schema.db.blogPosts.length, 1);
  assert.equal(response, null);
});

test('if a shorthand tries to access an unknown type it throws an error', function(assert) {
  let request = { url: '/foobars/1', params: { id: '1' } };
  let handler = new DeleteShorthandRouteHandler(this.schema, this.serializer, undefined, '/foobars/:id');

  assert.throws(function() {
    handler.handle(request);
  }, /model doesn't exist/);
  assert.ok(true);
});
