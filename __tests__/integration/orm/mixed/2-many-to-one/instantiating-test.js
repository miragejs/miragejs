import Helper from './_helper';
import { module, test } from 'qunit';

describe('Integration | ORM | Mixed | One To Many | instantiating', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  });

  test('the child accepts a saved parent id', assert => {
    let user = this.helper.savedParent();
    let post = this.schema.posts.new({ userId: user.id });

    expect(post.userId).toEqual(user.id);
    expect(post.user.attrs).toEqual(user.attrs);
    expect(post.attrs).toEqual({ userId: user.id });

    post.save();
    user.reload();

    expect(user.posts.includes(post)).toBeTruthy();
  });

  test('the child errors if the parent id doesnt exist', assert => {
    expect(function() {
      this.schema.posts.new({ userId: 2 });
    }).toThrow();
  });

  test('the child accepts a null parent id', assert => {
    let post = this.schema.posts.new({ userId: null });

    expect(post.userId).toEqual(null);
    expect(post.user).toEqual(null);
    expect(post.attrs).toEqual({ userId: null });
  });

  test('the child accepts a saved parent model', assert => {
    let user = this.helper.savedParent();
    let post = this.schema.posts.new({ user });

    expect(post.userId).toEqual(1);
    expect(post.user.attrs).toEqual(user.attrs);
    expect(post.attrs).toEqual({ userId: null });

    post.save();
    user.reload();

    expect(user.posts.includes(post)).toBeTruthy();
  });

  test('the child accepts a new parent model', assert => {
    let user = this.schema.users.new({ age: 300 });
    let post = this.schema.posts.new({ user });

    expect(post.userId).toEqual(null);
    expect(post.user).toEqual(user);
    expect(post.attrs).toEqual({ userId: null });
    expect(user.posts.includes(post)).toBeTruthy();
  });

  test('the child accepts a null parent model', assert => {
    let post = this.schema.posts.new({ user: null });

    expect(post.userId).toEqual(null);
    expect(post.user).toEqual(null);
    expect(post.attrs).toEqual({ userId: null });
  });

  test('the child accepts a parent model and id', assert => {
    let user = this.helper.savedParent();
    let post = this.schema.posts.new({ user, userId: user.id });

    expect(post.userId).toEqual('1');
    expect(post.user).toEqual(user);
    expect(post.attrs).toEqual({ userId: user.id });

    expect(user.posts.includes(post)).toBeTruthy();
  });

  test('the child accepts no reference to a parent id or model as empty obj', assert => {
    let post = this.schema.posts.new({});

    expect(post.userId).toEqual(null);
    expect(post.user).toEqual(null);
    expect(post.attrs).toEqual({ userId: null });
  });

  test('the child accepts no reference to a parent id or model', assert => {
    let post = this.schema.posts.new();

    expect(post.userId).toEqual(null);
    expect(post.user).toEqual(null);
    expect(post.attrs).toEqual({ userId: null });
  });
});
