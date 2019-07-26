import Helper from './_helper';
import { Model } from '@miragejs/server';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Named | create', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
    this.helper.schema.registerModel('foo', Model);
  });

  test('it sets up associations correctly when passing in the foreign key', assert => {
    let author = this.helper.schema.create('user');
    let post = this.helper.schema.create('post', {
      authorId: author.id
    });

    expect(post.authorId).toEqual(author.id);
    expect(post.author.attrs).toEqual(author.attrs);
    expect(this.helper.schema.db.users.length).toEqual(1);
    expect(this.helper.schema.db.users[0]).toEqual({ id: '1' });
    expect(this.helper.schema.db.posts.length).toEqual(1);
    expect(this.helper.schema.db.posts[0]).toEqual({ id: '1', authorId: '1' });
  });

  test('it sets up associations correctly when passing in the association itself', assert => {
    let author = this.helper.schema.create('user');
    let post = this.helper.schema.create('post', {
      author
    });

    expect(post.authorId).toEqual(author.id);
    expect(post.author.attrs).toEqual(author.attrs);
    expect(this.helper.schema.db.users.length).toEqual(1);
    expect(this.helper.schema.db.users[0]).toEqual({ id: '1' });
    expect(this.helper.schema.db.posts.length).toEqual(1);
    expect(this.helper.schema.db.posts[0]).toEqual({ id: '1', authorId: '1' });
  });

  test('it throws an error if a model is passed in without a defined relationship', assert => {
    let { schema } = this.helper;

    expect(function() {
      schema.create('post', {
        foo: schema.create('foo')
      });
    }).toThrow();
  });

  test('it throws an error if a collection is passed in without a defined relationship', assert => {
    let { schema } = this.helper;
    schema.create('foo');
    schema.create('foo');

    expect(function() {
      schema.create('post', {
        foos: schema.foos.all()
      });
    }).toThrow();
  });
});
