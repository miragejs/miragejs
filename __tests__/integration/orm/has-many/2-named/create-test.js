import Helper from './_helper';
import { Model } from '@miragejs/server';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Named | create', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
    this.helper.schema.registerModel('foo', Model);
  });

  test('it sets up associations correctly when passing in the foreign key', assert => {
    let post = this.helper.schema.create('post');
    let user = this.helper.schema.create('user', {
      blogPostIds: [ post.id ]
    });

    expect(user.blogPostIds).toEqual([ post.id ]);
    expect(user.attrs.blogPostIds).toEqual([ post.id ]);
    expect(user.blogPosts.models[0].attrs).toEqual(post.attrs);
    expect(this.helper.db.posts.length).toEqual(1);
    expect(this.helper.db.posts[0]).toEqual({ id: '1' });
    expect(this.helper.db.users.length).toEqual(1);
    expect(this.helper.db.users[0]).toEqual({ id: '1', blogPostIds: [ '1' ] });
  });

  test('it sets up associations correctly when passing in an array of models', assert => {
    let post = this.helper.schema.create('post');
    let user = this.helper.schema.create('user', {
      blogPosts: [ post ]
    });

    expect(user.blogPostIds).toEqual([ post.id ]);
    expect(user.attrs.blogPostIds).toEqual([ post.id ]);
    expect(user.blogPosts.models[0].attrs).toEqual(post.attrs);
    expect(this.helper.db.posts.length).toEqual(1);
    expect(this.helper.db.posts[0]).toEqual({ id: '1' });
    expect(this.helper.db.users.length).toEqual(1);
    expect(this.helper.db.users[0]).toEqual({ id: '1', blogPostIds: [ '1' ] });
  });

  test('it sets up associations correctly when passing in a collection', assert => {
    let post = this.helper.schema.create('post');
    let user = this.helper.schema.create('user', {
      blogPosts: this.helper.schema.posts.all()
    });

    expect(user.blogPostIds).toEqual([ post.id ]);
    expect(user.attrs.blogPostIds).toEqual([ post.id ]);
    expect(user.blogPosts.models[0].attrs).toEqual(post.attrs);
    expect(this.helper.db.posts.length).toEqual(1);
    expect(this.helper.db.posts[0]).toEqual({ id: '1' });
    expect(this.helper.db.users.length).toEqual(1);
    expect(this.helper.db.users[0]).toEqual({ id: '1', blogPostIds: [ '1' ] });
  });

  test('it throws an error if a model is passed in without a defined relationship', assert => {
    let { schema } = this.helper;

    expect(function() {
      schema.create('user', {
        foo: schema.create('foo')
      });
    }).toThrow();
  });

  test('it throws an error if an array of models is passed in without a defined relationship', assert => {
    let { schema } = this.helper;

    expect(function() {
      schema.create('user', {
        foos: [ schema.create('foo') ]
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
