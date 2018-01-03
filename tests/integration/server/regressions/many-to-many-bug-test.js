import { module, test } from 'qunit';
import { Model, hasMany, JSONAPISerializer } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';
import promiseAjax from 'dummy/tests/helpers/promise-ajax';

module('Integration | Server | Regressions | Many to many bug', function(hooks) {
  hooks.beforeEach(function() {
    this.server = new Server({
      environment: 'test',
      models: {
        post: Model.extend({
          tags: hasMany()
        }),
        tag: Model.extend({
          posts: hasMany()
        })
      },
      serializers: {
        application: JSONAPISerializer
      },
      baseConfig() {
        this.resource('posts');
      }
    });
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test('it works', async function(assert) {
    assert.expect(6);

    let serverTagA = this.server.create('tag', { name: 'A', slug: 'a' });
    let serverTagB = this.server.create('tag', { name: 'B', slug: 'b' });
    let serverPost = this.server.create('post', {
      title: 'Post 1',
      tags: [ serverTagA, serverTagB ]
    });

    assert.equal(serverTagA.postIds.length, 1);
    assert.equal(serverTagB.postIds.length, 1);
    assert.deepEqual(serverPost.tagIds, [ '1', '2' ]);

    await promiseAjax({
      method: 'PATCH',
      url: '/posts/1',
      data: JSON.stringify({
        "data": {
          "id": "1",
          "attributes": {
            "title": "Post 2"
          },
          "relationships": {
            "tags": {
              "data": [
                {
                  "type": "tags",
                  "id": "2"
                }
              ]
            }
          },
          "type": "posts"
        }
      })
    });

    serverTagA.reload();
    serverTagB.reload();
    serverPost.reload();

    assert.deepEqual(serverTagA.postIds, []);
    assert.deepEqual(serverTagB.postIds, [ '1' ]);
    assert.deepEqual(serverPost.tagIds, [ '2' ]);
  });

});
