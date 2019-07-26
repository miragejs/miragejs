import Helper from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One-Way Reflexive | instantiating', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  });

  test('the child accepts a saved parent id', assert => {
    let parent = this.helper.savedParent();
    let child = this.schema.users.new({ userId: parent.id });

    expect(child.userId).toEqual(parent.id);
    expect(child.user.attrs).toEqual(parent.attrs);
    expect(child.attrs).toEqual({ userId: parent.id });
  });

  test('the child errors if the parent id doesnt exist', assert => {
    expect(function() {
      this.schema.users.new({ userId: 2 });
    }).toThrow();
  });

  test('the child accepts a null parent id', assert => {
    let child = this.schema.users.new({ userId: null });

    expect(child.userId).toEqual(null);
    expect(child.user).toEqual(null);
    expect(child.attrs).toEqual({ userId: null });
  });

  test('the child accepts a saved parent model', assert => {
    let parent = this.helper.savedParent();
    let child = this.schema.users.new({ user: parent });

    expect(child.userId).toEqual(1);
    expect(child.user.attrs).toEqual(parent.attrs);
  });

  test('the child accepts a new parent model', assert => {
    let zelda = this.schema.users.new({ name: 'Zelda' });
    let child = this.schema.users.new({ user: zelda });

    expect(child.userId).toEqual(null);
    expect(child.user).toEqual(zelda);
    expect(child.attrs).toEqual({ userId: null });
  });

  test('the child accepts a null parent model', assert => {
    let child = this.schema.users.new({ user: null });

    expect(child.userId).toEqual(null);
    expect(child.user).toEqual(null);
    expect(child.attrs).toEqual({ userId: null });
  });

  test('the child accepts a parent model and id', assert => {
    let parent = this.helper.savedParent();
    let child = this.schema.users.new({ user: parent, userId: parent.id });

    expect(child.userId).toEqual('1');
    expect(child.user.attrs).toEqual(parent.attrs);
    expect(child.attrs).toEqual({ userId: parent.id });
  });

  test('the child accepts no reference to a parent id or model as empty obj', assert => {
    let child = this.schema.users.new({});

    expect(child.userId).toEqual(null);
    expect(child.user).toEqual(null);
    expect(child.attrs).toEqual({ userId: null });
  });

  test('the child accepts no reference to a parent id or model', assert => {
    let child = this.schema.users.new();

    expect(child.userId).toEqual(null);
    expect(child.user).toEqual(null);
    expect(child.attrs).toEqual({ userId: null });
  });
});
