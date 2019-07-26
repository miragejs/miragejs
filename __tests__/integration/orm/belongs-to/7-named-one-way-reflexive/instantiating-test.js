import Helper from "./_helper";
import { module, test } from "qunit";

describe("Integration | ORM | Belongs To | Named One-Way Reflexive | instantiating", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  });

  test("the child accepts a saved parent id", assert => {
    let parent = this.helper.savedParent();
    let child = this.schema.users.new({ parentId: parent.id });

    expect(child.parentId).toEqual(parent.id);
    expect(child.parent.attrs).toEqual(parent.attrs);
    expect(child.attrs).toEqual({ parentId: parent.id });
  });

  test("the child errors if the parent id doesnt exist", assert => {
    expect(function() {
      this.schema.users.new({ parentId: 2 });
    }).toThrow();
  });

  test("the child accepts a null parent id", assert => {
    let child = this.schema.users.new({ parentId: null });

    expect(child.parentId).toEqual(null);
    expect(child.parent).toEqual(null);
    expect(child.attrs).toEqual({ parentId: null });
  });

  test("the child accepts a saved parent model", assert => {
    let parent = this.helper.savedParent();
    let child = this.schema.users.new({ parent });

    expect(child.parentId).toEqual(1);
    expect(child.parent.attrs).toEqual(parent.attrs);
  });

  test("the child accepts a new parent model", assert => {
    let zelda = this.schema.users.new({ name: "Zelda" });
    let child = this.schema.users.new({ parent: zelda });

    expect(child.parentId).toEqual(null);
    expect(child.parent).toEqual(zelda);
    expect(child.attrs).toEqual({ parentId: null });
  });

  test("the child accepts a null parent model", assert => {
    let child = this.schema.users.new({ parent: null });

    expect(child.parentId).toEqual(null);
    expect(child.parent).toEqual(null);
    expect(child.attrs).toEqual({ parentId: null });
  });

  test("the child accepts a parent model and id", assert => {
    let parent = this.helper.savedParent();
    let child = this.schema.users.new({ parent, parentId: parent.id });

    expect(child.parentId).toEqual("1");
    expect(child.parent.attrs).toEqual(parent.attrs);
    expect(child.attrs).toEqual({ parentId: parent.id });
  });

  test("the child accepts no reference to a parent id or model as empty obj", assert => {
    let child = this.schema.users.new({});

    expect(child.parentId).toEqual(null);
    expect(child.parent).toEqual(null);
    expect(child.attrs).toEqual({ parentId: null });
  });

  test("the child accepts no reference to a parent id or model", assert => {
    let child = this.schema.users.new();

    expect(child.parentId).toEqual(null);
    expect(child.parent).toEqual(null);
    expect(child.attrs).toEqual({ parentId: null });
  });
});
