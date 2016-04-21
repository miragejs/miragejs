// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
import Mirage from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';
import Model from 'ember-cli-mirage/orm/model';
import Serializer from 'ember-cli-mirage/serializer';
import {module, test} from 'qunit';

module('Integration | Serializers | Base | Full Request', {
  beforeEach() {
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
        })
      },
      serializers: {
        application: Serializer.extend({
          embed: true,
          root: false
        }),
        author: Serializer.extend({
          embed: true,
          attrs: ['id', 'first'],
          include: ['posts']
        }),
        comment: Serializer.extend({
          embed: true,
          root: false,
          include(request) {
            return request.queryParams.include_post ? ['post'] : [];
          }
        })
      }
    });
    this.server.timing = 0;
    this.server.logging = false;
  },
  afterEach() {
    this.server.shutdown();
  }
});

test('the appropriate serializer is used', function(assert) {
  assert.expect(1);
  let done = assert.async();
  let author = this.server.schema.authors.create({
    first: 'Link',
    last: 'of Hyrule',
    age: 323
  });
  author.createPost({ title: 'Lorem ipsum' });

  this.server.get('/authors/:id', function(schema, request) {
    let { id } = request.params;

    return schema.authors.find(id);
  });

  $.ajax({
    method: 'GET',
    url: '/authors/1'
  }).done(function(res) {
    assert.deepEqual(res, {
      author: {
        id: '1',
        first: 'Link',
        posts: [
          { id: '1', title: 'Lorem ipsum' }
        ]
      }
    });
    done();
  });
});

test('a response falls back to the application serializer, if it exists', function(assert) {
  assert.expect(1);
  let done = assert.async();
  this.server.schema.posts.create({
    title: 'Lorem',
    date: '20001010'
  });

  this.server.get('/posts/:id', function(schema, request) {
    let { id } = request.params;

    return schema.posts.find(id);
  });

  $.ajax({
    method: 'GET',
    url: '/posts/1'
  }).done(function(res) {
    assert.deepEqual(res, {
      id: '1',
      title: 'Lorem',
      date: '20001010'
    });
    done();
  });
});

test('serializer.include is invoked when it is a function', function(assert) {
  assert.expect(1);
  let done = assert.async();
  let post = this.server.schema.posts.create({
    title: 'Lorem',
    date: '20001010'
  });
  post.createComment({
    description: 'Lorem is the best'
  });

  this.server.get('/comments/:id', function(schema, request) {
    let { id } = request.params;
    return schema.comments.find(id);
  });

  $.ajax({
    method: 'GET',
    url: '/comments/1?include_post=true'
  }).done(function(res) {
    assert.deepEqual(res, {
      id: '1',
      description: 'Lorem is the best',
      post: {
        id: '1',
        title: 'Lorem',
        date: '20001010'
      }
    });
    done();
  });
});
