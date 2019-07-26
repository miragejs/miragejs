import Helper from './_helper';
import { module, test } from 'qunit';

describe('Integration | ORM | Belongs To | One-to-one Polymorphic | instantiating', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  });

  test('the child accepts a saved parent id', assert => {
    let post = this.helper.savedParent();
    let comment = this.schema.comments.new({ commentableId: { type: 'post', id: post.id } });

    expect(comment.commentableId).toEqual({ type: 'post', id: post.id });
    expect(comment.commentable.attrs).toEqual(post.attrs);
    expect(comment.attrs).toEqual({ commentableId: { type: 'post', id: post.id } });
  });

  test('the child errors if the parent id doesnt exist', assert => {
    expect(function() {
      this.schema.comments.new({ commentableId: { type: 'post', id: 2 } });
    }).toThrow();
  });

  test('the child accepts a null parent id', assert => {
    let comment = this.schema.comments.new({ commentableId: null });

    expect(comment.commentableId).toEqual(null);
    expect(comment.commentable).toEqual(null);
    expect(comment.attrs).toEqual({ commentableId: null });
  });

  test('the child accepts a saved parent model', assert => {
    let post = this.helper.savedParent();
    let comment = this.schema.comments.new({ commentable: post });

    expect(comment.commentableId).toEqual({ type: 'post', id: post.id });
    expect(comment.commentable.attrs).toEqual(post.attrs);
    expect(comment.attrs).toEqual({ commentableId: null }); // this would update when saved
  });

  test('the child accepts a new parent model', assert => {
    let post = this.schema.posts.new({ age: 300 });
    let comment = this.schema.comments.new({ commentable: post });

    expect(comment.commentableId).toEqual({ type: 'post', id: undefined });
    expect(comment.commentable).toEqual(post);
    expect(comment.attrs).toEqual({ commentableId: null });
  });

  test('the child accepts a null parent model', assert => {
    let comment = this.schema.comments.new({ commentable: null });

    expect(comment.commentableId).toEqual(null);
    expect(comment.commentable).toEqual(null);
    expect(comment.attrs).toEqual({ commentableId: null });
  });

  test('the child accepts a parent model and id', assert => {
    let post = this.helper.savedParent();
    let comment = this.schema.comments.new({ commentable: post, commentableId: { type: 'post', id: post.id } });

    expect(comment.commentableId).toEqual({ type: 'post', id: '1' });
    expect(comment.commentable).toEqual(post);
    expect(comment.attrs).toEqual({ commentableId: { type: 'post', id: post.id } });
  });

  test('the child accepts no reference to a parent id or model as empty obj', assert => {
    let comment = this.schema.comments.new({});

    expect(comment.commentableId).toEqual(null);
    expect(comment.commentable).toEqual(null);
    expect(comment.attrs).toEqual({ commentableId: null });
  });

  test('the child accepts no reference to a parent id or model', assert => {
    let comment = this.schema.comments.new();

    expect(comment.commentableId).toEqual(null);
    expect(comment.commentable).toEqual(null);
    expect(comment.attrs).toEqual({ commentableId: null });
  });
});
