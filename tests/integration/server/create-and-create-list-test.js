import { module, test } from 'qunit';
import { Model, Factory, hasMany, belongsTo } from 'ember-cli-mirage';
import Inflector from 'ember-inflector';
import Server from 'ember-cli-mirage/server';
// import escape from 'escape-string-regexp';
import regExpFromString from '../../helpers/reg-exp-from-string';

// eslint-disable-next-line no-console
let originalWarn = console.warn;

function expectNoWarning(assert) {
  // eslint-disable-next-line no-console
  console.warn = () => {
    assert.notOk(true, 'no warning should be logged');
  };
}

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
    this.Data = Model.extend();

    this.server = new Server({
      environment: 'test',
      models: {
        contact: this.Contact,
        amazingContact: this.AmazingContact,
        post: this.Post,
        author: this.Author,
        data: this.Data
      },
      factories: {
        contact: Factory.extend({
          name: 'Yehuda'
        }),
        amazingContact: Factory
      }
    });
    this.server.timing = 0;
    this.server.logging = false;
  });

  hooks.afterEach(function() {
    this.server.shutdown();

    // eslint-disable-next-line no-console
    console.warn = originalWarn;
  });

  test('create throws when passing in an undefined model', function(assert) {
    expectNoWarning(assert);

    assert.throws(() => {
      this.server.create('foo');
    }, regExpFromString(`You called server.create('foo') but no model or factory was found.`));
  });

  // This used to be deprecated behavior, but now it errors. So we test it separately from the nonsense test above.
  test('create throws when passing in a pluralized version of a model', function(assert) {
    assert.expect(1);

    assert.throws(() => {
      this.server.create('contacts');
    }, regExpFromString(`You called server.create('contacts') but no model or factory was found. Make sure you're passing in the singularized version of the model or factory name`));
  });

  test('create returns a Model if one is defined', function(assert) {
    expectNoWarning(assert);

    let contact = this.server.create('contact');

    assert.ok(contact instanceof this.Contact, 'expected a Contact');
    assert.equal(contact.name, 'Yehuda', 'the factory is used');
  });

  test('create returns a Model instance if the Model name is uncountable', function(assert) {
    expectNoWarning(assert);

    Inflector.inflector.uncountable('data');
    let data = this.server.create('data');

    assert.ok(data instanceof this.Data, 'expected a Data');
  });

  test('createList throws when passing in an undefined model', function(assert) {
    expectNoWarning(assert);

    assert.throws(() => {
      this.server.createList('foo', 1);
    }, regExpFromString(`You called server.createList('foo') but no model or factory was found.`));
  });

  // This used to be deprecated behavior, but now it errors. So we test it separately from the nonsense test above.
  test('createList throws when passing in a pluralized version of a model', function(assert) {
    assert.expect(1);

    assert.throws(() => {
      this.server.createList('contacts', 1);
    }, regExpFromString(`You called server.createList('contacts') but no model or factory was found. Make sure you're passing in the singularized version of the model or factory name.`));
  });

  test('createList returns Models if one is defined', function(assert) {
    expectNoWarning();

    let contacts = this.server.createList('contact', 1);

    assert.ok(contacts[0] instanceof this.Contact, 'expected a Contactl');
    assert.equal(contacts[0].name, 'Yehuda', 'the factory is used');
  });

  test('createList returns Models if the model name is uncountable', function(assert) {
    expectNoWarning(assert);

    Inflector.inflector.uncountable('data');
    let data = this.server.createList('data', 1);

    assert.ok(data[0] instanceof this.Data, 'expected a Data');
  });

  test('create returns a Model if one is defined, when using a compound name', function(assert) {
    expectNoWarning(assert);

    let contact = this.server.create('amazing-contact');

    assert.ok(contact instanceof this.AmazingContact, 'expected an AmazingContact');
  });

  test('createList returns Models if one is defined, when using a compound name', function(assert) {
    expectNoWarning(assert);

    let contacts = this.server.createList('amazing-contact', 1);

    assert.ok(contacts[0] instanceof this.AmazingContact, 'expected an AmazingContact');
  });

  test('create falls back to a model if no factory is defined', function(assert) {
    expectNoWarning(assert);

    let post = this.server.create('post');

    assert.ok(post instanceof this.Post);
    assert.equal(post.id, 1);
  });

  test('createList falls back to a model if no factory is defined', function(assert) {
    expectNoWarning(assert);

    let posts = this.server.createList('post', 2);

    assert.ok(posts[0] instanceof this.Post);
    assert.equal(posts.length, 2);
    assert.equal(posts[0].id, 1);
  });

  test('create sets up the db correctly when passing in fks', function(assert) {
    expectNoWarning(assert);

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
    expectNoWarning(assert);

    let author = server.create('author');
    let post = this.server.create('post', {
      author
    });

    assert.equal(author.posts.models.length, 1);
    assert.deepEqual(post.author.attrs, author.attrs);
    assert.equal(this.server.db.posts[0].authorId, author.id);
  });
});
