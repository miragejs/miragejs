import Helper from "./_helper";

describe("External | Shared | ORM | Mixed | One To Many | instantiating", () => {
  let helper, schema;
  beforeEach(() => {
    helper = new Helper();
    schema = helper.schema;
  });
  afterEach(() => {
    helper.shutdown();
  });

  test("the child accepts a saved parent id", () => {
    let user = helper.savedParent();
    let post = schema.posts.new({ userId: user.id });

    expect(post.userId).toEqual(user.id);
    expect(post.user.attrs).toEqual(user.attrs);
    expect(post.attrs).toEqual({ userId: user.id });

    post.save();
    user.reload();

    expect(user.posts.includes(post)).toBeTruthy();
  });

  test("the child errors if the parent id doesnt exist", () => {
    expect(function () {
      schema.posts.new({ userId: 2 });
    }).toThrow();
  });

  test("the child accepts a null parent id", () => {
    let post = schema.posts.new({ userId: null });

    expect(post.userId).toBeNull();
    expect(post.user).toBeNull();
    expect(post.attrs).toEqual({ userId: null });
  });

  test("the child accepts a saved parent model", () => {
    let user = helper.savedParent();
    let post = schema.posts.new({ user });

    expect(post.userId).toBe("1");
    expect(post.user.attrs).toEqual(user.attrs);
    expect(post.attrs).toEqual({ userId: null });

    post.save();
    user.reload();

    expect(user.posts.includes(post)).toBeTruthy();
  });

  test("the child accepts a new parent model", () => {
    let user = schema.users.new({ age: 300 });
    let post = schema.posts.new({ user });

    expect(post.userId).toBeNil();
    expect(post.user).toEqual(user);
    expect(post.attrs).toEqual({ userId: null });
    expect(user.posts.includes(post)).toBeTruthy();
  });

  test("the child accepts a null parent model", () => {
    let post = schema.posts.new({ user: null });

    expect(post.userId).toBeNull();
    expect(post.user).toBeNull();
    expect(post.attrs).toEqual({ userId: null });
  });

  test("the child accepts a parent model and id", () => {
    let user = helper.savedParent();
    let post = schema.posts.new({ user, userId: user.id });

    expect(post.userId).toBe("1");
    expect(post.user).toEqual(user);
    expect(post.attrs).toEqual({ userId: user.id });

    expect(user.posts.includes(post)).toBeTruthy();
  });

  test("the child accepts no reference to a parent id or model as empty obj", () => {
    let post = schema.posts.new({});

    expect(post.userId).toBeNull();
    expect(post.user).toBeNull();
    expect(post.attrs).toEqual({ userId: null });
  });

  test("the child accepts no reference to a parent id or model", () => {
    let post = schema.posts.new();

    expect(post.userId).toBeNull();
    expect(post.user).toBeNull();
    expect(post.attrs).toEqual({ userId: null });
  });
});
