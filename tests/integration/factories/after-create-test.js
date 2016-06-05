import { module, test } from 'qunit';
import { Model, Factory, belongsTo } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';

module('Integration | Server | Factories | afterCreate', {
  beforeEach() {
    this.server = new Server({
      environment: 'test',
      models: {
        author: Model,
        post: Model.extend({
          author: belongsTo()
        }),
        comment: Model.extend({
          post: belongsTo()
        })
      },
      factories: {
        author: Factory.extend({
          afterCreate(author, server) {
            author.update({ name: 'Sam' });
            server.create('post', { author });
          }
        }),
        post: Factory.extend({
          title: 'Lorem ipsum',
          afterCreate(post, server) {
            server.create('comment', { post });
          }
        }),
        comment: Factory.extend({
          text: 'Yo soy el nino'
        })
      }
    });
  },
  afterEach() {
    this.server.shutdown();
  }
});

test('it works for models', function(assert) {
  let author = this.server.create('author');

  assert.equal(author.name, 'Sam');
  assert.deepEqual(this.server.db.posts.length, 1);
  assert.deepEqual(this.server.db.posts[0], { id: '1', title: 'Lorem ipsum', authorId: '1' });
  assert.deepEqual(this.server.db.comments.length, 1);
  assert.deepEqual(this.server.db.comments[0], { id: '1', text: 'Yo soy el nino', postId: '1' });
});

// test('it works for db records', function(assert) {
// });
