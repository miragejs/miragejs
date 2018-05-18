import Mirage from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';
import Model from 'ember-cli-mirage/orm/model';
import Serializer from 'ember-cli-mirage/serializer';
import {module, test} from 'qunit';
import promiseAjax from '../../../helpers/promise-ajax';

module('Integration | Serializers | Base | Full Request', function(hooks) {
  hooks.beforeEach(function() {
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
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test('the appropriate serializer is used', async function(assert) {
    assert.expect(1);

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

    let { data } = await promiseAjax({
      method: 'GET',
      url: '/authors/1'
    });

    assert.deepEqual(data, {
      author: {
        id: '1',
        first: 'Link',
        posts: [
          { id: '1', title: 'Lorem ipsum' }
        ]
      }
    });
  });

  test('components decoded', async function(assert) {
    assert.expect(1);

    this.server.get('/authors/:id', function(schema, request) {
      let { id } = request.params;

      return { data: { id } };
    });

    let { data } = await promiseAjax({
      method: 'GET',
      url: '/authors/%3A1'
    });

    assert.deepEqual(data, { data: { id: ':1' } });
  });

  test('a response falls back to the application serializer, if it exists', async function(assert) {
    assert.expect(1);
    this.server.schema.posts.create({
      title: 'Lorem',
      date: '20001010'
    });

    this.server.get('/posts/:id', function(schema, request) {
      let { id } = request.params;

      return schema.posts.find(id);
    });

    let { data } = await promiseAjax({
      method: 'GET',
      url: '/posts/1'
    });

    assert.deepEqual(data, {
      id: '1',
      title: 'Lorem',
      date: '20001010'
    });
  });

  test('serializer.include is invoked when it is a function', async function(assert) {
    assert.expect(1);
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

    let { data } = await promiseAjax({
      method: 'GET',
      url: '/comments/1?include_post=true'
    });

    assert.deepEqual(data, {
      id: '1',
      description: 'Lorem is the best',
      post: {
        id: '1',
        title: 'Lorem',
        date: '20001010'
      }
    });
  });
});
