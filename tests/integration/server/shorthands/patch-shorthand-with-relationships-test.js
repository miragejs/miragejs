import { module, test } from 'qunit';
import Server from 'ember-cli-mirage/server';
import { Model, belongsTo, hasMany } from 'ember-cli-mirage';
import PostShorthandRouteHandler from 'ember-cli-mirage/route-handlers/shorthands/post';
import JSONAPISerializer from 'ember-cli-mirage/serializers/json-api-serializer';
import promiseAjax from '../../../helpers/promise-ajax';

module('Integration | Server | Shorthands | Patch with relationships', function(hooks) {
  hooks.beforeEach(function() {
    this.newServerWithSchema = function(schema) {
      this.server = new Server({
        environment: 'development',
        models: schema
      });
      this.server.timing = 0;
      this.server.logging = false;
      this.schema = this.server.schema;

      this.serializer = new JSONAPISerializer();

      return this.server;
    };

    this.handleRequest = function({ url, body }) {
      let request = { requestBody: JSON.stringify(body), url };
      let handler = new PostShorthandRouteHandler(this.schema, this.serializer);
      return handler.handle(request);
    };
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test('it can null out belongs to relationships', async function(assert) {
    let server = this.newServerWithSchema({
      author: Model.extend({
        posts: hasMany()
      }),
      post: Model.extend({
        author: belongsTo()
      })
    });
    server.loadConfig(function() {
      this.patch('/posts/:id');
    });

    let author = server.create('author');
    let post = server.create('post', { author });

    await promiseAjax({
      method: 'PATCH',
      url: `/posts/${post.id}`,
      data: JSON.stringify({
        data: {
          attributes: {
            title: 'Post 1'
          },
          relationships: {
            author: {
              data: null
            }
          }
        }
      })
    });

    post.reload();
    assert.equal(post.author, null);
  });

  test('it can null out belongs to polymorphic relationships', async function(assert) {
    let server = this.newServerWithSchema({
      video: Model.extend(),
      post: Model.extend(),
      comment: Model.extend({
        commentable: belongsTo({ polymorphic: true })
      })
    });
    server.loadConfig(function() {
      this.patch('/comments/:id');
    });

    let video = server.create('video');
    let comment = server.create('comment', {
      commentable: video
    });

    await promiseAjax({
      method: 'PATCH',
      url: `/comments/${comment.id}`,
      data: JSON.stringify({
        data: {
          attributes: {
            title: 'Post 1'
          },
          relationships: {
            commentable: {
              data: null
            }
          }
        }
      })
    });

    comment.reload();
    assert.equal(comment.commentable, null);
  });

  test('it can null out has many polymorphic relationships', async function(assert) {
    let server = this.newServerWithSchema({
      car: Model.extend(),
      watch: Model.extend(),
      user: Model.extend({
        collectibles: hasMany({ polymorphic: true })
      })
    });
    server.loadConfig(function() {
      this.patch('/users/:id');
    });

    let car = server.create('car');
    let watch = server.create('watch');
    let user = server.create('user', {
      collectibles: [ car, watch ]
    });

    await promiseAjax({
      method: 'PATCH',
      url: `/users/${user.id}`,
      data: JSON.stringify({
        data: {
          attributes: {
          },
          relationships: {
            collectibles: {
              data: null
            }
          }
        }
      })
    });

    user.reload();
    assert.equal(user.collectibles.length, 0);
  });

  test('it camelizes relationship names', async function(assert) {
    let server = this.newServerWithSchema({
      postAuthor: Model.extend({
        posts: hasMany()
      }),
      post: Model.extend({
        postAuthor: belongsTo()
      })
    });

    server.loadConfig(function() {
      this.patch('/posts/:id');
    });

    let postAuthor = server.create('post-author');
    let post = server.create('post');

    await promiseAjax({
      method: 'PATCH',
      url: `/posts/${post.id}`,
      data: JSON.stringify({
        data: {
          attributes: {
          },
          relationships: {
            'post-author': {
              data: {
                id: postAuthor.id,
                type: 'post-authors'
              }
            }
          }
        }
      })
    });

    post.reload();
    assert.equal(post.postAuthorId, postAuthor.id, 'relationship gets updated successfully');
  });
});
