import { module, test } from 'qunit';
import {
  Model,
  JSONAPISerializer,
  Response
} from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';
import HeadShorthandRouteHandler from 'ember-cli-mirage/route-handlers/shorthands/head';

module('Integration | Route Handlers | HEAD shorthand', {
  beforeEach() {
    this.server = new Server({
      environment: 'development',
      models: {
        author: Model,
        photo: Model
      }
    });
    this.server.timing = 0;
    this.server.logging = false;

    this.authors = [
      { id: 1, name: 'Link' },
      { id: 2, name: 'Zelda' },
      { id: 3, name: 'Epona' }
    ];
    this.photos = [
      { id: 1, title: 'Amazing', location: 'Hyrule' },
      { id: 2, title: 'Photo', location: 'Goron City' }
    ];
    this.server.db.loadData({
      authors: this.authors,
      photos: this.photos
    });

    this.schema = this.server.schema;
    this.serializer = new JSONAPISerializer();
  },
  afterEach() {
    this.server.shutdown();
  }
});

test('undefined shorthand with an ID that is not in the DB will return a 404 Response', function(assert) {
  let request = { url: '/authors', params: { id: 101 } };
  let handler = new HeadShorthandRouteHandler(this.schema, this.serializer, undefined, '/authors');

  let response = handler.handle(request);

  assert.ok(response instanceof Response);
  assert.equal(response.code, 404);
});

test('undefined shorthand with an ID that is in the DB will return a 204 Response', function(assert) {
  let request = { url: '/authors', params: { id: 1 } };
  let handler = new HeadShorthandRouteHandler(this.schema, this.serializer, undefined, '/authors');

  let response = handler.handle(request);

  assert.ok(response instanceof Response);
  assert.equal(response.code, 204);
});

test('undefined shorthand with coalesce true will return a 204 response if one of the IDs are found', function(assert) {
  let request = { url: '/authors?ids[]=1&ids[]=3', queryParams: { ids: [1, 3] } };
  let options = { coalesce: true };
  let handler = new HeadShorthandRouteHandler(this.schema, this.serializer, undefined, '/authors', options);

  let response = handler.handle(request);

  assert.ok(response instanceof Response);
  assert.equal(response.code, 204);
});

test('undefined shorthand string (no id) shorthand returns a 204 (regardless of the length of the collection)', function(assert) {
  let request = { url: '/authors' };
  let handler = new HeadShorthandRouteHandler(this.schema, this.serializer, undefined, '/authors');

  let response = handler.handle(request);

  assert.ok(response instanceof Response);
  assert.equal(response.code, 204);
});

test('string shorthand with an ID that is not in the DB will return a 404 Response', function(assert) {
  let request = { url: '/authors', params: { id: 101 } };
  let handler = new HeadShorthandRouteHandler(this.schema, this.serializer, 'author');

  let response = handler.handle(request);

  assert.ok(response instanceof Response);
  assert.equal(response.code, 404);
});

test('string shorthand with an ID that is in the DB will return a 204 Response', function(assert) {
  let request = { url: '/authors', params: { id: 1 } };
  let handler = new HeadShorthandRouteHandler(this.schema, this.serializer, 'author');

  let response = handler.handle(request);

  assert.ok(response instanceof Response);
  assert.equal(response.code, 204);
});

test('string shorthand with coalesce true will return a 204 response if one of the IDs are found', function(assert) {
  let request = { url: '/authors?ids[]=1&ids[]=3', queryParams: { ids: [1, 3] } };
  let options = { coalesce: true };
  let handler = new HeadShorthandRouteHandler(this.schema, this.serializer, 'author', '/people', options);

  let response = handler.handle(request);

  assert.ok(response instanceof Response);
  assert.equal(response.code, 204);
});

test('string shorthand string (no id) shorthand returns a 204 (regardless of the length of the collection)', function(assert) {
  let request = { url: '/authors' };
  let handler = new HeadShorthandRouteHandler(this.schema, this.serializer, 'author');

  let response = handler.handle(request);

  assert.ok(response instanceof Response);
  assert.equal(response.code, 204);
});
