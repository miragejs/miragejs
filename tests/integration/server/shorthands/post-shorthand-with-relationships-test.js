import { module, test } from 'qunit';
import Server from 'ember-cli-mirage/server';
import { Model, belongsTo, hasMany } from 'ember-cli-mirage';
import PostShorthandRouteHandler from 'ember-cli-mirage/route-handlers/shorthands/post';
import JSONAPISerializer from 'ember-cli-mirage/serializers/json-api-serializer';
import promiseAjax from '../../../helpers/promise-ajax';

module('Integration | Server | Shorthands | Post with relationships', function(hooks) {
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

  test('it works for belongs to', async function(assert) {
    let server = this.newServerWithSchema({
      author: Model.extend({
        posts: hasMany()
      }),
      post: Model.extend({
        author: belongsTo()
      })
    });
    server.loadConfig(function() {
      this.post('/posts');
    });

    assert.equal(server.db.posts.length, 0);

    let author = server.create('author');

    let response = await promiseAjax({
      method: 'POST',
      url: '/posts',
      data: JSON.stringify({
        data: {
          attributes: {
            title: 'Post 1'
          },
          relationships: {
            author: {
              data: {
                type: 'authors',
                id: author.id
              }
            }
          }
        }
      })
    });

    let postId = response.data.post.id;
    let post = server.schema.posts.find(postId);

    assert.ok(post);
    assert.equal(post.author.id, author.id);
  });

  test('it works for belongs to polymorphic', async function(assert) {
    let server = this.newServerWithSchema({
      video: Model.extend(),
      post: Model.extend(),
      comment: Model.extend({
        commentable: belongsTo({ polymorphic: true })
      })
    });
    server.loadConfig(function() {
      this.post('/comments');
    });

    assert.equal(server.db.comments.length, 0);

    let video = server.create('video');

    let response = await promiseAjax({
      method: 'POST',
      url: '/comments',
      data: JSON.stringify({
        data: {
          type: 'comments',
          attributes: {
            text: 'Comment 1'
          },
          relationships: {
            commentable: {
              data: {
                type: 'videos',
                id: video.id
              }
            }
          }
        }
      })
    });

    let commentId = response.data.comment.id;
    let comment = server.schema.comments.find(commentId);

    assert.ok(comment);
    assert.ok(comment.commentable.equals(video));
  });

  test('it works for has many polymorphic', async function(assert) {
    let server = this.newServerWithSchema({
      car: Model.extend(),
      watch: Model.extend(),
      user: Model.extend({
        collectibles: hasMany({ polymorphic: true })
      })
    });
    server.loadConfig(function() {
      this.post('/users');
    });

    assert.equal(server.db.users.length, 0);

    let car = server.create('car');
    let watch = server.create('watch');

    let response = await promiseAjax({
      method: 'POST',
      url: '/users',
      data: JSON.stringify({
        data: {
          type: 'users',
          attributes: {
            name: 'Elon Musk'
          },
          relationships: {
            collectibles: {
              data: [
                {
                  type: 'cars',
                  id: car.id
                },
                {
                  type: 'watches',
                  id: watch.id
                }
              ]
            }
          }
        }
      })
    });

    let userId = response.data.user.id;
    let user = server.schema.users.find(userId);

    assert.ok(user);
    assert.ok(user.collectibles.includes(car));
    assert.ok(user.collectibles.includes(watch));
  });

});
