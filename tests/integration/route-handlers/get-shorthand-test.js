import { module, test } from 'qunit';
import {
  Model,
  hasMany,
  belongsTo,
  JSONAPISerializer,
  Response
} from 'ember-cli-mirage';
import Collection from 'ember-cli-mirage/orm/collection';
import Server from 'ember-cli-mirage/server';
import GetShorthandRouteHandler from 'ember-cli-mirage/route-handlers/shorthands/get';

module('Integration | Route Handlers | GET shorthand', {
  beforeEach() {
    this.server = new Server({
      environment: 'development',
      models: {
        author: Model.extend({
          posts: hasMany()
        }),
        post: Model.extend({
          author: belongsTo(),
          comments: hasMany()
        }),
        comment: Model.extend({
          post: belongsTo()
        }),
        photo: Model,
        'project-owner': Model
      }
    });
    this.server.timing = 0;
    this.server.logging = false;

    this.authors = [
      { id: 1, name: 'Link' },
      { id: 2, name: 'Zelda' },
      { id: 3, name: 'Epona' }
    ];
    this.posts = [
      { id: 1, title: 'Lorem', authorId: 1 },
      { id: 2, title: 'Ipsum', authorId: 1 }
    ];
    this.photos = [
      { id: 1, title: 'Amazing', location: 'Hyrule' },
      { id: 2, title: 'Photo', location: 'Goron City' }
    ];
    this.projectOwners = [
      { id: 1, name: 'Nintendo' }
    ];
    this.server.db.loadData({
      authors: this.authors,
      posts: this.posts,
      photos: this.photos,
      projectOwners: this.projectOwners
    });

    this.schema = this.server.schema;
    this.serializer = new JSONAPISerializer();
  },
  afterEach() {
    this.server.shutdown();
  }
});

test('undefined shorthand returns the collection of models', function(assert) {
  let request = { url: '/authors' };
  let handler = new GetShorthandRouteHandler(this.schema, this.serializer, undefined, '/authors');

  let authors = handler.handle(request);

  assert.equal(authors.models.length, 3);
  assert.ok(authors.models[0] instanceof Model);
  assert.equal(authors.models[0].modelName, 'author');
});

test('undefined shorthand ignores query params', function(assert) {
  let request = { url: '/authors?foo=bar' };
  let handler = new GetShorthandRouteHandler(this.schema, this.serializer, undefined, '/authors');

  let authors = handler.handle(request);

  assert.equal(authors.models.length, 3);
  assert.ok(authors.models[0] instanceof Model);
  assert.equal(authors.models[0].modelName, 'author');
});

test('undefined shorthand can return a single model', function(assert) {
  let request = { url: '/authors/2', params: { id: 2 } };
  let handler = new GetShorthandRouteHandler(this.schema, this.serializer, undefined, '/authors/:id');

  let author = handler.handle(request);

  assert.ok(author instanceof Model);
  assert.equal(author.modelName, 'author');
  assert.equal(author.name, 'Zelda');
});

test('undefined shorthand returns a 404 if a singular resource does not exist', function(assert) {
  let request = { url: '/authors/99', params: { id: 99 } };
  let handler = new GetShorthandRouteHandler(this.schema, this.serializer, undefined, '/authors/:id');

  let author = handler.handle(request);

  assert.ok(author instanceof Response);
  assert.equal(author.code, 404);
});

test('undefined shorthand ignores query params for a singular resource', function(assert) {
  let request = { url: '/authors/2?foo=bar', params: { id: 2 } };
  let handler = new GetShorthandRouteHandler(this.schema, this.serializer, undefined, '/authors/:id');

  let author = handler.handle(request);

  assert.ok(author instanceof Model);
  assert.equal(author.modelName, 'author');
  assert.equal(author.name, 'Zelda');
});

test('undefined shorthand with coalesce true returns the appropriate models', function(assert) {
  let request = { url: '/authors?ids[]=1&ids[]=3', queryParams: { ids: [1, 3] } };
  let options = { coalesce: true };
  let handler = new GetShorthandRouteHandler(this.schema, this.serializer, undefined, '/authors', options);

  let authors = handler.handle(request);

  assert.equal(authors.models.length, 2);
  assert.deepEqual(authors.models.map((author) => author.name), ['Link', 'Epona']);
});

test('string shorthand returns the correct collection of models', function(assert) {
  let request = { url: '/people' };
  let handler = new GetShorthandRouteHandler(this.schema, this.serializer, 'author');

  let authors = handler.handle(request);

  assert.equal(authors.models.length, 3);
  assert.ok(authors.models[0] instanceof Model);
  assert.equal(authors.models[0].modelName, 'author');
});

test('string shorthand with an id returns the correct model', function(assert) {
  let request = { url: '/people/2', params: { id: 2 } };
  let handler = new GetShorthandRouteHandler(this.schema, this.serializer, 'author');

  let author = handler.handle(request);

  assert.ok(author instanceof Model);
  assert.equal(author.modelName, 'author');
  assert.equal(author.name, 'Zelda');
});

test('string shorthand with an id 404s if the model is not found', function(assert) {
  let request = { url: '/people/99', params: { id: 99 } };
  let handler = new GetShorthandRouteHandler(this.schema, this.serializer, 'author');

  let author = handler.handle(request);

  assert.ok(author instanceof Response);
  assert.equal(author.code, 404);
});

test('string shorthand with coalesce returns the correct models', function(assert) {
  let request = { url: '/people?ids[]=1&ids[]=3', queryParams: { ids: [1, 3] } };
  let options = { coalesce: true };
  let handler = new GetShorthandRouteHandler(this.schema, this.serializer, 'author', '/people', options);

  let authors = handler.handle(request);

  assert.equal(authors.models.length, 2);
  assert.deepEqual(authors.models.map((author) => author.name), ['Link', 'Epona']);
});

test('array shorthand returns the correct models', function(assert) {
  let url = '/home';
  let request = { url };
  let handler = new GetShorthandRouteHandler(this.schema, this.serializer, ['authors', 'photos'], url);

  let models = handler.handle(request);

  assert.ok(models[0] instanceof Collection);
  assert.equal(models[0].modelName, 'author');
  assert.equal(models[0].models.length, this.authors.length);

  assert.ok(models[1] instanceof Collection);
  assert.equal(models[1].modelName, 'photo');
  assert.equal(models[1].models.length, this.photos.length);
});

test('array shorthand for a singular resource errors', function(assert) {
  let url = '/authors/1';
  let request = { url, params: { id: 1 } };
  let handler = new GetShorthandRouteHandler(this.schema, this.serializer, ['author', 'posts'], url);

  assert.throws(function() {
    handler.handle(request);
  }, /create a serializer/);
});

test('shorthand for list of models with a dash in their name', function(assert) {
  let url = '/project-owners';
  let request = { url };
  let handler = new GetShorthandRouteHandler(this.schema, this.serializer, undefined, url);
  let models = handler.handle(request);

  assert.equal(models.models.length, 1);
  assert.ok(models.models[0] instanceof Model);
  assert.equal(models.models[0].modelName, 'project-owner');
});

test('if a shorthand tries to access an unknown type it throws an error', function(assert) {
  let url = '/foobars';
  let request = { url };
  let handler = new GetShorthandRouteHandler(this.schema, this.serializer, undefined, url);

  assert.throws(function() {
    handler.handle(request);
  }, /model doesn't exist/);
});
