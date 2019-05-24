import { module, test } from 'qunit';
import { Model, hasMany, belongsTo, JSONAPISerializer } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';
import promiseAjax from 'dummy/tests/helpers/promise-ajax';

module('Integration | Server | Regressions | 1613 Two bidirectional many-to-many with same target model update bug', function(hooks) {
  hooks.beforeEach(function() {
    this.server = new Server({
      environment: 'test',
      models: {
        user: Model.extend({
          authoredPosts: hasMany('post', { inverse: 'author' }),
          editedPosts: hasMany('post', { inverse: 'editor' })
        }),
        post: Model.extend({
          author: belongsTo('user', { inverse: 'authoredPosts' }),
          editor: belongsTo('user', { inverse: 'editedPosts' })
        })
      },
      serializers: {
        application: JSONAPISerializer.extend(),
        user: JSONAPISerializer.extend({
          alwaysIncludeLinkageData: true
        })
      },
      baseConfig() {
        this.resource('posts');
        this.resource('users');
      }
    });
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test('it stores both relationships', async function(assert) {
    let post = this.server.create('post');
    let user = this.server.create('user');

    assert.expect(1);

    await promiseAjax({
      method: 'PATCH',
      url: `/posts/${post.id}`,
      contentType: 'application/vnd.api+json',
      data: JSON.stringify({
        data: {
          id: post.id,
          attributes: {},
          relationships: {
            author: {
              data: {
                type: 'users',
                id: user.id
              }
            },
            editor: {
              data: {
                type: 'users',
                id: user.id
              }
            }
          },
          type: 'posts'
        }
      })
    });

    let response = await promiseAjax({
      method: 'GET',
      url: `/users/${user.id}`
    });

    let json = response.data;

    assert.deepEqual(json.data,
      {
        "attributes": {},
        "id": "1",
        "relationships": {
          "authored-posts": {
            "data": [
              {
                "id": "1",
                "type": "posts"
              }
            ]
          },
          "edited-posts": {
            "data": [
              {
                "id": "1",
                "type": "posts"
              }
            ]
          }
        },
        "type": "users"
      });
  });

});
