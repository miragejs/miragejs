import {module, test} from 'qunit';
import Server from 'ember-cli-mirage/server';

module('integration:get-shorthands', {
  beforeEach: function() {
    this.server = new Server({
      environment: 'development'
    });
    this.server.timing = 0;
    this.server.logging = false;

    this.authors = [
      {id: 1, name: 'Link'},
      {id: 2, name: 'Zelda'},
      {id: 3, name: 'Epona'}
    ];
    this.posts = [
      {id: 1, title: 'Lorem', author_id: 1},
      {id: 2, title: 'Ipsum', author_id: 1}
    ];
    this.server.db.loadData({
      authors: this.authors,
      posts: this.posts
    });
  },
  afterEach: function() {
    this.server.shutdown();
  }
});

test('undefined shorthand can return a collection', function(assert) {
  assert.expect(1);
  var done = assert.async();

  this.server.get('/authors');

  $.ajax({method: 'GET', url: '/authors'}).then(data => {
    assert.deepEqual(data, { authors: this.authors });
    done();
  });
});

test('undefined shorthand ignores query params', function(assert) {
  assert.expect(1);
  var done = assert.async();

  this.server.get('/authors');

  $.ajax({method: 'GET', url: '/authors?foo'}).then(data => {
    assert.deepEqual(data, { authors: this.authors });
    done();
  });
});

test('undefined shorthand can return a singular resource', function(assert) {
  assert.expect(1);
  var done = assert.async();

  this.server.get('/authors/:id');

  $.ajax({method: 'GET', url: '/authors/1'}).then(data => {
    assert.deepEqual(data, { author: this.authors[0] });
    done();
  });
});

test('undefined shorthand returns a 404 if a singular resource does not exist', function(assert) {
  assert.expect(1);
  var done = assert.async();

  this.server.get('/authors/:id');

  $.ajax({method: 'GET', url: '/authors/9'}).fail(res => {
    assert.equal(res.status, 404);
    done();
  });
});

test('undefined shorthand ignores query params on a singular resource', function(assert) {
  assert.expect(1);
  var done = assert.async();

  this.server.get('/authors/:id');

  $.ajax({method: 'GET', url: '/authors/1?foo=bar'}).then(data => {
    assert.deepEqual(data, { author: this.authors[0] });
    done();
  });
});

test('undefined shorthand can coalesce ids', function(assert) {
  assert.expect(1);
  var done = assert.async();

  this.server.get('/authors', undefined, {coalesce: true});

  $.ajax({method: 'GET', url: '/authors?ids[]=1&ids[]=3'}).then(data => {
    assert.deepEqual(data, { authors: this.authors.filter(author => [1,3].indexOf(author.id) > -1) });
    done();
  });
});

test('string shorthand returns the named collection', function(assert) {
  assert.expect(1);
  var done = assert.async();

  this.server.get('/people', 'authors');

  $.ajax({method: 'GET', url: '/people'}).then(data => {
    assert.deepEqual(data, { authors: this.authors });
    done();
  });
});

test('string shorthand with an id returns the named record', function(assert) {
  assert.expect(1);
  var done = assert.async();

  this.server.get('/people/:id', 'author');

  $.ajax({method: 'GET', url: '/people/1'}).then(data => {
    assert.deepEqual(data, { author: this.authors[0] });
    done();
  });
});

test('string shorthand with an id returns 404 if the record is not found', function(assert) {
  assert.expect(1);
  var done = assert.async();

  this.server.get('/people/:id', 'author');

  $.ajax({method: 'GET', url: '/people/9'}).fail(res => {
    assert.equal(res.status, 404);
    done();
  });
});

test('string shorthand with coalesce returns the correct records', function(assert) {
  assert.expect(1);
  var done = assert.async();

  this.server.get('/people', 'authors', {coalesce: true});

  $.ajax({method: 'GET', url: '/people?ids[]=1&ids[]=3'}).then(data => {
    assert.deepEqual(data, { authors: this.authors.filter(author => [1,3].indexOf(author.id) > -1) });
    done();
  });
});

test('array shorthand returns all resources of each type', function(assert) {
  assert.expect(1);
  var done = assert.async();

  this.server.get('/authors', ['authors', 'posts']);

  $.ajax({method: 'GET', url: '/authors'}).then(data => {
    assert.deepEqual(data, {
      authors: this.authors,
      posts: this.posts
    });
    done();
  });
});

test('array shorthand for a singular resource returns all related resources of each type', function(assert) {
  assert.expect(1);
  var done = assert.async();

  this.server.get('/authors/:id', ['author', 'posts']);

  $.ajax({method: 'GET', url: '/authors/1'}).then(data => {
    assert.deepEqual(data, {
      author: this.authors[0],
      posts: this.posts.filter(post => +post.author_id === 1)
    });
    done();
  });
});
