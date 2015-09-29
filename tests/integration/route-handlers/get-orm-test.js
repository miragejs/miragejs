import {module, test} from 'qunit';
import Model from 'ember-cli-mirage/orm/model';
import Collection from 'ember-cli-mirage/orm/collection';
import Server from 'ember-cli-mirage/server';
import Mirage from 'ember-cli-mirage';
import GetShorthandRouteHandler from 'ember-cli-mirage/route-handlers/shorthands/get';
import JSONAPISerializer from 'ember-cli-mirage/serializers/json-api-serializer';

module('Integration | Route Handlers | GET with ORM', {
  beforeEach: function() {
    this.server = new Server({
      environment: 'development',
      models: {
        author: Model.extend({
          posts: Mirage.hasMany()
        }),
        post: Model.extend({
          author: Mirage.belongsTo(),
          comments: Mirage.hasMany()
        }),
        comment: Model.extend({
          post: Mirage.belongsTo()
        }),
        photo: Model
      }
    });
    this.server.timing = 0;
    this.server.logging = false;

    this.authors = [
      {id: 1, name: 'Link'},
      {id: 2, name: 'Zelda'},
      {id: 3, name: 'Epona'}
    ];
    this.posts = [
      {id: 1, title: 'Lorem', authorId: 1},
      {id: 2, title: 'Ipsum', authorId: 1}
    ];
    this.photos = [
      {id: 1, title: 'Amazing', location: 'Hyrule'},
      {id: 2, title: 'Photo', location: 'Goron City'}
    ];
    this.server.db.loadData({
      authors: this.authors,
      posts: this.posts,
      photos: this.photos,
    });

    this.schema = this.server.schema;
    this.serializer = new JSONAPISerializer();
  },
  afterEach: function() {
    this.server.shutdown();
  }
});

test('undefined shorthand returns the collection of models', function(assert) {
  let request = {url: '/authors'};
  let handler = new GetShorthandRouteHandler(this.schema, this.serializer);

  let authors = handler.handle(request);

  assert.equal(authors.length, 3);
  assert.ok(authors[0] instanceof Model);
  assert.equal(authors[0].type, 'author');
});

test('undefined shorthand ignores query params', function(assert) {
  let request = {url: '/authors?foo=bar'};
  let handler = new GetShorthandRouteHandler(this.schema, this.serializer);

  let authors = handler.handle(request);

  assert.equal(authors.length, 3);
  assert.ok(authors[0] instanceof Model);
  assert.equal(authors[0].type, 'author');
});

test('undefined shorthand can return a single model', function(assert) {
  let request = {url: '/authors/2', params: {id: 2}};
  let handler = new GetShorthandRouteHandler(this.schema, this.serializer);

  let author = handler.handle(request);

  assert.ok(author instanceof Model);
  assert.equal(author.type, 'author');
  assert.equal(author.name, 'Zelda');
});

test('undefined shorthand returns null if a singular resource does not exist', function(assert) {
  let request = {url: '/authors/99', params: {id: 99}};
  let handler = new GetShorthandRouteHandler(this.schema, this.serializer);

  let author = handler.handle(request);

  assert.ok(author === null);
});

test('undefined shorthand ignores query params for a singular resource', function(assert) {
  let request = {url: '/authors/2?foo=bar', params: {id: 2}};
  let handler = new GetShorthandRouteHandler(this.schema, this.serializer);

  let author = handler.handle(request);

  assert.ok(author instanceof Model);
  assert.equal(author.type, 'author');
  assert.equal(author.name, 'Zelda');
});

test('undefined shorthand with coalesce true returns the appropriate models', function(assert) {
  let request = {url: '/authors?ids[]=1&ids[]=3', queryParams: {ids: [1, 3]}};
  let options = {coalesce: true};
  let handler = new GetShorthandRouteHandler(this.schema, this.serializer, undefined, options);

  let authors = handler.handle(request);

  assert.equal(authors.length, 2);
  assert.deepEqual(authors.map(author => author.name), ['Link', 'Epona']);
});

test('string shorthand returns the correct collection of models', function(assert) {
  let request = {url: '/people'};
  let handler = new GetShorthandRouteHandler(this.schema, this.serializer, 'author');

  let authors = handler.handle(request);

  assert.equal(authors.length, 3);
  assert.ok(authors[0] instanceof Model);
  assert.equal(authors[0].type, 'author');
});

test('string shorthand with an id returns the correct model', function(assert) {
  let request = {url: '/people/2', params: {id: 2}};
  let handler = new GetShorthandRouteHandler(this.schema, this.serializer, 'author');

  let author = handler.handle(request);

  assert.ok(author instanceof Model);
  assert.equal(author.type, 'author');
  assert.equal(author.name, 'Zelda');
});

test('string shorthand with an id returns null if the model is not found', function(assert) {
  let request = {url: '/people/99', params: {id: 99}};
  let handler = new GetShorthandRouteHandler(this.schema, this.serializer, 'author');

  let author = handler.handle(request);

  assert.ok(author === null);
});

test('string shorthand with coalesce returns the correct models', function(assert) {
  let request = {url: '/people?ids[]=1&ids[]=3', queryParams: {ids: [1, 3]}};
  let options = {coalesce: true};
  let handler = new GetShorthandRouteHandler(this.schema, this.serializer, 'author', options);

  let authors = handler.handle(request);

  assert.equal(authors.length, 2);
  assert.deepEqual(authors.map(author => author.name), ['Link', 'Epona']);
});

test('array shorthand returns the correct models', function(assert) {
  let request = {url: '/home'};
  let handler = new GetShorthandRouteHandler(this.schema, this.serializer, ['authors', 'photos']);

  let models = handler.handle(request);

  assert.ok(models[0] instanceof Collection);
  assert.equal(models[0].type, 'author');
  assert.equal(models[0].length, this.authors.length);

  assert.ok(models[1] instanceof Collection);
  assert.equal(models[1].type, 'photo');
  assert.equal(models[1].length, this.photos.length);
});

test('array shorthand for a singular resource errors', function(assert) {
  let request = {url: '/authors/1', params: {id: 1}};
  let handler = new GetShorthandRouteHandler(this.schema, this.serializer, ['author', 'posts']);

  assert.throws(function() {
    handler.handle(request);
  }, /create a serializer/);
});
