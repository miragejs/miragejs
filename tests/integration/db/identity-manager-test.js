import { module, test } from 'qunit';
import { Model, hasMany, belongsTo } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';
import DefaultIdentityManager from 'ember-cli-mirage/identity-manager';

const CustomIdentityManager = class {
  constructor() {
    this.wasCalled = false;
  }
  fetch() {
    if (this.wasCalled) {
      throw new Error('IdentityManager used for test only supports one call to fetch');
    }
    this.wasCalled = true;
    return 'custom-id';
  }
  set(id) {
    throw new Error('Not implemented for test.');
  }
  reset() {
    throw new Error('Not implemented for test.');
  }
};

module('Integration | Server | Factory creation', function(hooks) {
  hooks.beforeEach(function() {
    this.Post = Model.extend({
      author: belongsTo()
    });
    this.Author = Model.extend({
      posts: hasMany()
    });
    this.Comment = Model.extend({
      post: belongsTo()
    });

    this.server = new Server({
      environment: 'test',
      identityManagers: {
        post: DefaultIdentityManager,
        author: CustomIdentityManager
      },
      models: {
        author: this.Author,
        comment: this.Comment,
        post: this.Post
      }
    });
    this.server.timing = 0;
    this.server.logging = false;
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test('it uses identity managers defined by config', function(assert) {
    let author = server.create('author');
    let comment = server.create('comment');
    let post = server.create('post');
    assert.equal(author.id, 'custom-id', 'custom identity manager defined in config is used');
    assert.equal(post.id, '1', 'ember-cli-mirage identity manager defined in config is used');
    assert.equal(comment.id, '1', 'falls back to ember-cli-mirage identity manager if no one is defined in config for model');
  });

  test('attribute hash is passed to identity managers fetch method', function(assert) {
    assert.expect(2);

    let dataForRecord = {
      foo: 'bar'
    };
    let IdentityManagerForTest = class {
      fetch(data) {
        assert.ok(data);
        assert.deepEqual(data, dataForRecord);
      }
    };
    let serverForTest = new Server({
      environment: 'test',
      identityManagers: {
        application: IdentityManagerForTest
      },
      models: {
        foo: Model.extend()
      }
    });
    serverForTest.create('foo', dataForRecord);
  });
});
