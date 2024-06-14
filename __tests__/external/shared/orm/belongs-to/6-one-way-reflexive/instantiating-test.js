import Helper from "./_helper";

describe("External | Shared | ORM | Belongs To | One-Way Reflexive | instantiating", () => {
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
    let child = schema.users.new({ userId: parent.id });

    expect(child.userId).toEqual(parent.id);
    expect(child.user.attrs).toEqual(parent.attrs);
    expect(child.attrs).toEqual({ userId: parent.id });
  });

  test("the child errors if the parent id doesnt exist", () => {
    expect(function () {
      schema.users.new({ userId: 2 });
    }).toThrow();
  });

  test("the child accepts a null parent id", () => {
    let child = schema.users.new({ userId: null });

    expect(child.userId).toBeNil();
    expect(child.user).toBeNil();
    expect(child.attrs).toEqual({ userId: null });
  });

  test("the child accepts a saved parent model", () => {
    let parent = helper.savedParent();
    let child = schema.users.new({ user: parent });

    expect(child.userId).toBe("1");
    expect(child.user.attrs).toEqual(parent.attrs);
  });

  test("the child accepts a new parent model", () => {
    let zelda = schema.users.new({ name: "Zelda" });
    let child = schema.users.new({ user: zelda });

    expect(child.userId).toBeNil();
    expect(child.user).toEqual(zelda);
    expect(child.attrs).toEqual({ userId: null });
  });

  test("the child accepts a null parent model", () => {
    let child = schema.users.new({ user: null });

    expect(child.userId).toBeNil();
    expect(child.user).toBeNil();
    expect(child.attrs).toEqual({ userId: null });
  });

  test("the child accepts a parent model and id", () => {
    let parent = helper.savedParent();
    let child = schema.users.new({ user: parent, userId: parent.id });

    expect(child.userId).toBe("1");
    expect(child.user.attrs).toEqual(parent.attrs);
    expect(child.attrs).toEqual({ userId: parent.id });
  });

  test("the child accepts no reference to a parent id or model as empty obj", () => {
    let child = schema.users.new({});

    expect(child.userId).toBeNil();
    expect(child.user).toBeNil();
    expect(child.attrs).toEqual({ userId: null });
  });

  test("the child accepts no reference to a parent id or model", () => {
    let child = schema.users.new();

    expect(child.userId).toBeNil();
    expect(child.user).toBeNil();
    expect(child.attrs).toEqual({ userId: null });
  });
});
