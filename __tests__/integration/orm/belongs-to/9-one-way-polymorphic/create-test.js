import Helper from './_helper';
import { Model } from '@miragejs/server';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One-way Polymorphic | create', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
    this.helper.schema.registerModel('foo', Model);
  });

  test('it sets up associations correctly when passing in the foreign key', assert => {
    let post = this.helper.schema.create('post');
    let comment = this.helper.schema.create('comment', {
      commentableId: { id: post.id, type: 'post' }
    });

    expect(comment.commentableId).toEqual({ id: post.id, type: 'post' });
    expect(comment.commentable.attrs).toEqual(post.attrs);
    expect(this.helper.schema.db.posts.length).toEqual(1);
    expect(this.helper.schema.db.posts[0]).toEqual({ id: '1' });
    expect(this.helper.schema.db.comments.length).toEqual(1);
    expect(this.helper.schema.db.comments[0]).toEqual({ id: '1', commentableId: { id: '1', type: 'post' } });
  });

  test('it sets up associations correctly when passing in the association itself', assert => {
    let post = this.helper.schema.create('post');
    let comment = this.helper.schema.create('comment', {
      commentable: post
    });

    expect(comment.commentableId).toEqual({ id: post.id, type: 'post' });
    expect(comment.commentable.attrs).toEqual(post.attrs);
    expect(this.helper.schema.db.posts.length).toEqual(1);
    expect(this.helper.schema.db.posts[0]).toEqual({ id: '1' });
    expect(this.helper.schema.db.comments.length).toEqual(1);
    expect(this.helper.schema.db.comments[0]).toEqual({ id: '1', commentableId: { id: '1', type: 'post' } });
  });
});
