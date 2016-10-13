import Helper from './_helper';
import { Model } from 'ember-cli-mirage';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Basic | create', {
  beforeEach() {
    this.helper = new Helper();
    this.helper.schema.registerModel('foo', Model);
  }
});

test('it sets up associations correctly when passing in the foreign key', function(assert) {
  let author = this.helper.schema.create('author');
  let post = this.helper.schema.create('post', {
    authorId: author.id
  });

  assert.equal(post.authorId, author.id);
  assert.deepEqual(post.author.attrs, author.attrs);
  assert.equal(this.helper.schema.db.authors.length, 1);
  assert.deepEqual(this.helper.schema.db.authors[0], { id: '1' });
  assert.equal(this.helper.schema.db.posts.length, 1);
  assert.deepEqual(this.helper.schema.db.posts[0], { id: '1', authorId: '1' });
});

test('it sets up associations correctly when passing in the association itself', function(assert) {
  let author = this.helper.schema.create('author');
  let post = this.helper.schema.create('post', {
    author
  });

  assert.equal(post.authorId, author.id);
  assert.deepEqual(post.author.attrs, author.attrs);
  assert.equal(this.helper.schema.db.authors.length, 1);
  assert.deepEqual(this.helper.schema.db.authors[0], { id: '1' });
  assert.equal(this.helper.schema.db.posts.length, 1);
  assert.deepEqual(this.helper.schema.db.posts[0], { id: '1', authorId: '1' });
});

test('it throws an error if a model is passed in without a defined relationship', function(assert) {
  let { schema } = this.helper;

  assert.throws(function() {
    schema.create('post', {
      foo: schema.create('foo')
    });
  }, /you haven't defined that key as an association on your model/);
});

test('it throws an error if a collection is passed in without a defined relationship', function(assert) {
  let { schema } = this.helper;
  schema.create('foo');
  schema.create('foo');

  assert.throws(function() {
    schema.create('post', {
      foos: schema.foos.all()
    });
  }, /you haven't defined that key as an association on your model/);
});
