import { module, test } from 'qunit';
import { Model, Factory, belongsTo, hasMany, trait, association } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';

module('Integration | Server | Factories | helpers', function(hooks) {
  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test('it creates associations with "association" helper in a dasherized factory', function(assert) {
    this.server = new Server({
      environment: 'test',
      models: {
        author: Model.extend({
          blogPosts: hasMany()
        }),
        blogPost: Model.extend({
          author: belongsTo()
        })
      },
      factories: {
        author: Factory.extend({
          name: 'Sam'
        }),
        blogPost: Factory.extend({
          title: 'Lorem ipsum',

          author: association()
        })
      }
    });

    let blogPost = this.server.create('blog-post');

    assert.ok(blogPost.author);

    let { db } = this.server;

    assert.equal(db.authors.length, 1);
    assert.deepEqual(db.authors[0], {
      id: '1',
      name: 'Sam',
      blogPostIds: ['1']
    });
  });

  test('it creates associations with "association" helper combininig with traits', function(assert) {
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

    let post = this.server.create('post', 'withCategory');

    assert.ok(post.kind);
    assert.ok(post.author);

    let { db } = this.server;

    assert.equal(db.posts.length, 1);
    assert.deepEqual(db.posts[0], {
      id: '1',
      title: 'Lorem ipsum',
      authorId: '1',
      kindId: '1'
    });

    assert.equal(db.authors.length, 1);
    assert.deepEqual(db.authors[0], {
      id: '1',
      name: 'Sam',
      postIds: ['1']
    });

    assert.equal(db.categories.length, 1);
    assert.deepEqual(db.categories[0], {
      id: '1',
      name: 'awesome software',
      postIds: ['1']
    });
  });

  test('it throws if using the association helper on a self-referential belongsTo relationship', function(assert) {
    this.server = new Server({
      environment: 'test',
      models: {
        page: Model.extend({
          parentPage: belongsTo('page', { inverse: 'childPages' }),
          childPages: hasMany('page', { inverse: 'parentPage' })
        })
      },
      factories: {
        page: Factory.extend({
          parentPage: association()
        })
      }
    });

    assert.throws(() => {
      this.server.create('page');
    }, /You're using the association\(\) helper on your page factory for parentPage, which is a belongsTo self-referential relationship. You can't do this as it will lead to infinite recursion. You can move the helper inside of a trait and use it selectively./);
  });
});
