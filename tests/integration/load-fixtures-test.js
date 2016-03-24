import {module, test} from 'qunit';
import Server from 'ember-cli-mirage/server';

module('Integration | Server #loadFixtures', {
  beforeEach() {
    this.server = new Server({
      environment: 'development',
      scenarios: {
        default() {}
      },
      factories: {
        author: {},
        post: {},
        comment: {}
      },
      fixtures: {
        authors: [
          { id: 1, name: 'Zelda' },
          { id: 2, name: 'Link' }
        ],
        posts: [
          { id: 1, title: 'Lorem' },
          { id: 2, title: 'Ipsum' }
        ],
        comments: [
          { id: 1, title: 'Lorem' }
        ]
      }
    });
  },
  afterEach() {
    this.server.shutdown();
  }
});

test('it can load all fixtures in the map', function(assert) {
  this.server.loadFixtures();

  assert.equal(this.server.db.authors.length, 2);
  assert.equal(this.server.db.posts.length, 2);
  assert.equal(this.server.db.comments.length, 1);
});

test('it can load a single named fixture file', function(assert) {
  this.server.loadFixtures('authors');

  assert.equal(this.server.db.authors.length, 2);
  assert.equal(this.server.db.posts.length, 0);
  assert.equal(this.server.db.comments.length, 0);
});

test('it can load several named single fixtures', function(assert) {
  this.server.loadFixtures('authors', 'posts');

  assert.equal(this.server.db.authors.length, 2);
  assert.equal(this.server.db.posts.length, 2);
  assert.equal(this.server.db.comments.length, 0);
});
