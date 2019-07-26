import Helper from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Basic | instantiating', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  });

  test('the child accepts a saved parent id', assert => {
    let author = this.helper.savedParent();
    let post = this.schema.posts.new({ authorId: author.id });

    expect(post.authorId).toEqual(author.id);
    expect(post.author).toEqual(author);
    expect(post.attrs).toEqual({ authorId: author.id });
  });

  test('the child errors if the parent id doesnt exist', assert => {
    expect(function() {
      this.schema.posts.new({ authorId: 2 });
    }).toThrow();
  });

  test('the child accepts a null parent id', assert => {
    let post = this.schema.posts.new({ authorId: null });

    expect(post.authorId).toEqual(null);
    expect(post.author).toEqual(null);
    expect(post.attrs).toEqual({ authorId: null });
  });

  test('the child accepts a saved parent model', assert => {
    let author = this.helper.savedParent();
    let post = this.schema.posts.new({ author });

    expect(post.authorId).toEqual(1);
    expect(post.author).toEqual(author);
  });

  test('the child accepts a new parent model', assert => {
    let zelda = this.schema.authors.new({ name: 'Zelda' });
    let post = this.schema.posts.new({ author: zelda });

    expect(post.authorId).toEqual(null);
    expect(post.author).toEqual(zelda);
    expect(post.attrs).toEqual({ authorId: null });
  });

  test('the child accepts a null parent model', assert => {
    let post = this.schema.posts.new({ author: null });

    expect(post.authorId).toEqual(null);
    expect(post.author).toEqual(null);
    expect(post.attrs).toEqual({ authorId: null });
  });

  test('the child accepts a parent model and id', assert => {
    let author = this.helper.savedParent();
    let post = this.schema.posts.new({ author, authorId: author.id });

    expect(post.authorId).toEqual('1');
    expect(post.author).toEqual(author);
    expect(post.attrs).toEqual({ authorId: author.id });
  });

  test('the child accepts no reference to a parent id or model as empty obj', assert => {
    let post = this.schema.posts.new({});

    expect(post.authorId).toEqual(null);
    expect(post.author).toEqual(null);
    expect(post.attrs).toEqual({ authorId: null });
  });

  test('the child accepts no reference to a parent id or model', assert => {
    let post = this.schema.posts.new();

    expect(post.authorId).toEqual(null);
    expect(post.author).toEqual(null);
    expect(post.attrs).toEqual({ authorId: null });
  });
});
