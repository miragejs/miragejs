import Helper from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Basic | instantiating', {
  beforeEach() {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  }
});

test('the child accepts a saved parent id', function(assert) {
  let author = this.helper.savedParent();
  let post = this.schema.posts.new({ authorId: author.id });

  assert.equal(post.authorId, author.id);
  assert.deepEqual(post.author, author);
  assert.deepEqual(post.attrs, { authorId: author.id });
});

test('the child errors if the parent id doesnt exist', function(assert) {
  assert.throws(function() {
    this.schema.posts.new({ authorId: 2 });
  }, /You're instantiating a post that has a authorId of 2, but that record doesn't exist in the database/);
});

test('the child accepts a null parent id', function(assert) {
  let post = this.schema.posts.new({ authorId: null });

  assert.equal(post.authorId, null);
  assert.deepEqual(post.author, null);
  assert.deepEqual(post.attrs, { authorId: null });
});

test('the child accepts a saved parent model', function(assert) {
  let author = this.helper.savedParent();
  let post = this.schema.posts.new({ author });

  assert.equal(post.authorId, 1);
  assert.deepEqual(post.author, author);
});

test('the child accepts a new parent model', function(assert) {
  let zelda = this.schema.authors.new({ name: 'Zelda' });
  let post = this.schema.posts.new({ author: zelda });

  assert.equal(post.authorId, null);
  assert.deepEqual(post.author, zelda);
  assert.deepEqual(post.attrs, { authorId: null });
});

test('the child accepts a null parent model', function(assert) {
  let post = this.schema.posts.new({ author: null });

  assert.equal(post.authorId, null);
  assert.deepEqual(post.author, null);
  assert.deepEqual(post.attrs, { authorId: null });
});

test('the child accepts a parent model and id', function(assert) {
  let author = this.helper.savedParent();
  let post = this.schema.posts.new({ author, authorId: author.id });

  assert.equal(post.authorId, '1');
  assert.deepEqual(post.author, author);
  assert.deepEqual(post.attrs, { authorId: author.id });
});

test('the child accepts no reference to a parent id or model as empty obj', function(assert) {
  let post = this.schema.posts.new({});

  assert.equal(post.authorId, null);
  assert.deepEqual(post.author, null);
  assert.deepEqual(post.attrs, { authorId: null });
});

test('the child accepts no reference to a parent id or model', function(assert) {
  let post = this.schema.posts.new();

  assert.equal(post.authorId, null);
  assert.deepEqual(post.author, null);
  assert.deepEqual(post.attrs, { authorId: null });
});
