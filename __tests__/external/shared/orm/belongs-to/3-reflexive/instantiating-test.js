import Helper from "./_helper";

describe("External | Shared | ORM | Belongs To | Reflexive | instantiating", () => {
  let helper, schema;

  beforeEach(() => {
    helper = new Helper();
    schema = helper.schema;
  });
  afterEach(() => {
    helper.shutdown();
  });

  test("the child accepts a saved parent id", () => {
    let friend = helper.savedParent();
    let user = schema.users.new({ userId: friend.id });

    expect(user.userId).toEqual(friend.id);
    expect(user.user.attrs).toEqual(friend.attrs);
    expect(user.attrs).toEqual({ userId: friend.id });
  });

  test("the child errors if the parent id doesnt exist", () => {
    expect(function () {
      schema.users.new({ userId: 2 });
    }).toThrow();
  });

  test("the child accepts a null parent id", () => {
    let user = schema.users.new({ userId: null });

    expect(user.userId).toBeNil();
    expect(user.user).toBeNil();
    expect(user.attrs).toEqual({ userId: null });
  });

  test("the child accepts a saved parent model", () => {
    let friend = helper.savedParent();
    let user = schema.users.new({ user: friend });

    expect(user.userId).toBe("1");
    expect(user.user.attrs).toEqual(friend.attrs);
    expect(user.attrs).toEqual({ userId: null }); // this would update when saved
  });

  test("the child accepts a new parent model", () => {
    let zelda = schema.users.new({ name: "Zelda" });
    let user = schema.users.new({ user: zelda });

    expect(user.userId).toBeNil();
    expect(user.user).toEqual(zelda);
    expect(user.attrs).toEqual({ userId: null });
  });

  test("the child accepts a null parent model", () => {
    let user = schema.users.new({ user: null });

    expect(user.userId).toBeNil();
    expect(user.user).toBeNil();
    expect(user.attrs).toEqual({ userId: null });
  });

  test("the child accepts a parent model and id", () => {
    let friend = helper.savedParent();
    let user = schema.users.new({ user: friend, userId: friend.id });

    expect(user.userId).toBe("1");
    expect(user.user).toEqual(friend);
    expect(user.attrs).toEqual({ userId: friend.id });
  });

  test("the child accepts no reference to a parent id or model as empty obj", () => {
    let user = schema.users.new({});

    expect(user.userId).toBeNil();
    expect(user.user).toBeNil();
    expect(user.attrs).toEqual({ userId: null });
  });

  test("the child accepts no reference to a parent id or model", () => {
    let user = schema.users.new();

    expect(user.userId).toBeNil();
    expect(user.user).toBeNil();
    expect(user.attrs).toEqual({ userId: null });
  });
});
