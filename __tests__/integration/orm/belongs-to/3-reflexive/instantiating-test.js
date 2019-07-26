import Helper from './_helper';
import { module, test } from 'qunit';

describe('Integration | ORM | Belongs To | Reflexive | instantiating', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  });

  test('the child accepts a saved parent id', assert => {
    let friend = this.helper.savedParent();
    let user = this.schema.users.new({ userId: friend.id });

    expect(user.userId).toEqual(friend.id);
    expect(user.user.attrs).toEqual(friend.attrs);
    expect(user.attrs).toEqual({ userId: friend.id });
  });

  test('the child errors if the parent id doesnt exist', assert => {
    expect(function() {
      this.schema.users.new({ userId: 2 });
    }).toThrow();
  });

  test('the child accepts a null parent id', assert => {
    let user = this.schema.users.new({ userId: null });

    expect(user.userId).toEqual(null);
    expect(user.user).toEqual(null);
    expect(user.attrs).toEqual({ userId: null });
  });

  test('the child accepts a saved parent model', assert => {
    let friend = this.helper.savedParent();
    let user = this.schema.users.new({ user: friend });

    expect(user.userId).toEqual(1);
    expect(user.user.attrs).toEqual(friend.attrs);
    expect(user.attrs).toEqual({ userId: null }); // this would update when saved
  });

  test('the child accepts a new parent model', assert => {
    let zelda = this.schema.users.new({ name: 'Zelda' });
    let user = this.schema.users.new({ user: zelda });

    expect(user.userId).toEqual(null);
    expect(user.user).toEqual(zelda);
    expect(user.attrs).toEqual({ userId: null });
  });

  test('the child accepts a null parent model', assert => {
    let user = this.schema.users.new({ user: null });

    expect(user.userId).toEqual(null);
    expect(user.user).toEqual(null);
    expect(user.attrs).toEqual({ userId: null });
  });

  test('the child accepts a parent model and id', assert => {
    let friend = this.helper.savedParent();
    let user = this.schema.users.new({ user: friend, userId: friend.id });

    expect(user.userId).toEqual('1');
    expect(user.user).toEqual(friend);
    expect(user.attrs).toEqual({ userId: friend.id });
  });

  test('the child accepts no reference to a parent id or model as empty obj', assert => {
    let user = this.schema.users.new({});

    expect(user.userId).toEqual(null);
    expect(user.user).toEqual(null);
    expect(user.attrs).toEqual({ userId: null });
  });

  test('the child accepts no reference to a parent id or model', assert => {
    let user = this.schema.users.new();

    expect(user.userId).toEqual(null);
    expect(user.user).toEqual(null);
    expect(user.attrs).toEqual({ userId: null });
  });
});
