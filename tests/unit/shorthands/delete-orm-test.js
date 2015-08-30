import {module, test} from 'qunit';
import Server from 'ember-cli-mirage/server';
import Model from 'ember-cli-mirage/orm/model';
import Mirage from 'ember-cli-mirage';
import del from 'ember-cli-mirage/shorthands/delete';

module('mirage:shorthands#del-with-orm', {
  beforeEach: function() {
    this.server = new Server({
      environment: 'development',
      modelsMap: {
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
      {id: 1, title: 'Lorem', author_id: '1'},
      {id: 2, title: 'Another', author_id: '2'},
    ];
    this.server.db.loadData({authors, posts});

    this.schema = this.server.schema;
  },
  afterEach: function() {
    this.server.shutdown();
  }
});

test('undefined shorthand deletes the record and returns null', function(assert) {
  let response = del.undefined(undefined, this.schema, {url: '/authors/1', params: {id: '1'}});

  assert.equal(this.schema.db.authors.length, 0);
  assert.equal(response, null);
});

test('query params are ignored', function(assert) {
  let response = del.undefined(undefined, this.schema, {url: '/authors/1?foo=bar', params: {id: '1'}, queryParams: {foo: 'bar'}});

  assert.equal(this.schema.db.authors.length, 0);
  assert.equal(response, null);
});

test('string shorthand deletes the record of the specified type', function(assert) {
  let response = del.string('author', this.schema, {url: '/people/1?foo=bar', params: {id: '1'}, queryParams: {foo: 'bar'}});

  assert.equal(this.schema.db.authors.length, 0);
  assert.equal(response, null);
});

test('array shorthand deletes the record and all related records', function(assert) {
  let response = del.array(['author', 'posts'], this.schema, {url: '/authors/1', params: {id: '1'}});

  assert.equal(this.schema.db.authors.length, 0);
  assert.equal(this.schema.db.posts.length, 1);
  assert.equal(response, null);
});
