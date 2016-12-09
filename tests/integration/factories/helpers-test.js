import { module, test } from 'qunit';
import { Model, Factory, belongsTo, hasMany, trait, association } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';

module('Integration | Server | Factories | helpers', {
  beforeEach() {
    this.server = new Server({
      environment: 'test',
      models: {
        author: Model.extend({
          posts: hasMany()
        }),
        category: Model.extend({
          posts: hasMany('post', { inverse: 'kind' })
        }),
        post: Model.extend({
          author: belongsTo(),
          kind: belongsTo('category')
        })
      },
      factories: {
        author: Factory.extend({
          name: 'Sam'
        }),
        category: Factory.extend({
          name: 'awesome software'
        }),
        post: Factory.extend({
          title: 'Lorem ipsum',

          author: association(),

          withCategory: trait({
            kind: association()
          })
        })
      }
    });
  },
  afterEach() {
    this.server.shutdown();
  }
});

test('it creates associations with "association" helper combininig with traits', function(assert) {
  this.server.create('post', 'withCategory');

  assert.equal(this.server.db.posts.length, 1);
  assert.deepEqual(
    this.server.db.posts[0],
    { id: '1', title: 'Lorem ipsum', authorId: '1', kindId: '1' }
  );
  assert.deepEqual(
    this.server.schema.posts.find(1).author.attrs,
    { id: '1', name: 'Sam' }
  );
  assert.deepEqual(
    this.server.schema.posts.find(1).kind.attrs,
    { id: '1', name: 'awesome software' }
  );

  assert.equal(this.server.db.authors.length, 1);
  assert.deepEqual(
    this.server.db.authors[0],
    { id: '1', name: 'Sam' }
  );
  assert.equal(this.server.schema.authors.find(1).posts.models.length, 1);
  assert.deepEqual(
    this.server.schema.authors.find(1).posts.models[0].attrs,
    { id: '1', title: 'Lorem ipsum', authorId: '1', kindId: '1' }
  );

  assert.equal(this.server.db.categories.length, 1);
  assert.deepEqual(
    this.server.db.categories[0],
    { id: '1', name: 'awesome software' }
  );
  assert.equal(this.server.schema.categories.find(1).posts.models.length, 1);
  assert.deepEqual(
    this.server.schema.categories.find(1).posts.models[0].attrs,
    { id: '1', title: 'Lorem ipsum', authorId: '1', kindId: '1' }
  );
});
