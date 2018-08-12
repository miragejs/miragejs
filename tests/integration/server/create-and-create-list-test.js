import { module, test } from 'qunit';
import { Model, Factory, hasMany, belongsTo } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';

module('Integration | Server | create and createList', function(hooks) {
  hooks.beforeEach(function() {
    this.Contact = Model.extend();
    this.AmazingContact = Model.extend();
    this.Post = Model.extend({
      author: belongsTo()
    });
    this.Author = Model.extend({
      posts: hasMany()
    });

    this.server = new Server({
      environment: 'test',
      models: {
        contact: this.Contact,
        amazingContact: this.AmazingContact,
        post: this.Post,
        author: this.Author
      },
      factories: {
        contact: Factory,
        amazingContact: Factory
      }
    });
    this.server.timing = 0;
    this.server.logging = false;
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test('create throws when passing in an undefined model', function(assert) {
    assert.throws(() => {
      this.server.create('foo');
    }, /You called server.create\('foo'\) but no model or factory was found\. Make sure you're using the singularized version of your model\./);
  });

  test('create throws when passing in a pluralized version of a model', function(assert) {
    assert.throws(() => {
      this.server.create('contacts');
    }, /You called server.create\('contacts'\) but no model or factory was found\. Make sure you're using the singularized version of your model\./);
  });

  test('create returns a Model if one is defined', function(assert) {
    let contact = this.server.create('contact');

    assert.ok(contact instanceof this.Contact, 'expected a Contact');
  });

  test('createList throws when passing in an undefined model', function(assert) {
    assert.throws(() => {
      this.server.createList('foo', 1);
    }, /You called server.createList\('foo'\) but no model or factory was found\. Make sure you're using the singularized version of your model\./);
  });

  test('createList throws when passing in a pluralized version of a model', function(assert) {
    assert.throws(() => {
      this.server.createList('contacts', 1);
    }, /You called server.createList\('contacts'\) but no model or factory was found\. Make sure you're using the singularized version of your model\./);
  });

  test('createList returns Models if one is defined', function(assert) {
    let contacts = this.server.createList('contact', 1);

    assert.ok(contacts[0] instanceof this.Contact, 'expected a Contactl');
  });

  test('create returns a Model if one is defined, when using a compound name', function(assert) {
    let contact = this.server.create('amazing-contact');

    assert.ok(contact instanceof this.AmazingContact, 'expected an AmazingContact');
  });

  test('createList returns Models if one is defined, when using a compound name', function(assert) {
    let contacts = this.server.createList('amazing-contact', 1);

    assert.ok(contacts[0] instanceof this.AmazingContact, 'expected an AmazingContact');
  });

  test('create falls back to a model if no factory is defined', function(assert) {
    let post = this.server.create('post');

    assert.ok(post instanceof this.Post);
    assert.equal(post.id, 1);
  });

  test('createList falls back to a model if no factory is defined', function(assert) {
    let posts = this.server.createList('post', 2);

    assert.ok(posts[0] instanceof this.Post);
    assert.equal(posts.length, 2);
    assert.equal(posts[0].id, 1);
  });

  test('create sets up the db correctly when passing in fks', function(assert) {
    let author = server.create('author');
    let post = this.server.create('post', {
      authorId: author.id
    });
    author.reload();

    assert.equal(author.posts.models.length, 1);
    assert.deepEqual(post.author.attrs, author.attrs);
    assert.equal(this.server.db.posts[0].authorId, author.id);
  });

  test('create sets up the db correctly when passing in models', function(assert) {
    let author = server.create('author');
    let post = this.server.create('post', {
      author
    });

    assert.equal(author.posts.models.length, 1);
    assert.deepEqual(post.author.attrs, author.attrs);
    assert.equal(this.server.db.posts[0].authorId, author.id);
  });
});
