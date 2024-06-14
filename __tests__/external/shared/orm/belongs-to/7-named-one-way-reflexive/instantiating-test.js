import Helper from "./_helper";

describe("External | Shared | ORM | Belongs To | Named One-Way Reflexive | instantiating", () => {
  let helper, schema;

  beforeEach(() => {
    helper = new Helper();
    schema = helper.schema;
  });
  afterEach(() => {
    helper.shutdown();
  });

  test("the child accepts a saved parent id", () => {
    let parent = helper.savedParent();
    let child = schema.users.new({ parentId: parent.id });

    expect(child.parentId).toEqual(parent.id);
    expect(child.parent.attrs).toEqual(parent.attrs);
    expect(child.attrs).toEqual({ parentId: parent.id });
  });

  test("the child errors if the parent id doesnt exist", () => {
    expect(function () {
      schema.users.new({ parentId: 2 });
    }).toThrow();
  });

  test("the child accepts a null parent id", () => {
    let child = schema.users.new({ parentId: null });

    expect(child.parentId).toBeNil();
    expect(child.parent).toBeNil();
    expect(child.attrs).toEqual({ parentId: null });
  });

  test("the child accepts a saved parent model", () => {
    let parent = helper.savedParent();
    let child = schema.users.new({ parent });

    expect(child.parentId).toBe("1");
    expect(child.parent.attrs).toEqual(parent.attrs);
  });

  test("the child accepts a new parent model", () => {
    let zelda = schema.users.new({ name: "Zelda" });
    let child = schema.users.new({ parent: zelda });

    expect(child.parentId).toBeNil();
    expect(child.parent).toEqual(zelda);
    expect(child.attrs).toEqual({ parentId: null });
  });

  test("the child accepts a null parent model", () => {
    let child = schema.users.new({ parent: null });

    expect(child.parentId).toBeNil();
    expect(child.parent).toBeNil();
    expect(child.attrs).toEqual({ parentId: null });
  });

  test("the child accepts a parent model and id", () => {
    let parent = helper.savedParent();
    let child = schema.users.new({ parent, parentId: parent.id });

    expect(child.parentId).toBe("1");
    expect(child.parent.attrs).toEqual(parent.attrs);
    expect(child.attrs).toEqual({ parentId: parent.id });
  });

  test("the child accepts no reference to a parent id or model as empty obj", () => {
    let child = schema.users.new({});

    expect(child.parentId).toBeNil();
    expect(child.parent).toBeNil();
    expect(child.attrs).toEqual({ parentId: null });
  });

  test("the child accepts no reference to a parent id or model", () => {
    let child = schema.users.new();

    expect(child.parentId).toBeNil();
    expect(child.parent).toBeNil();
    expect(child.attrs).toEqual({ parentId: null });
  });
});
