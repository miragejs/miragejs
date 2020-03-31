import Helper from "./_helper";

describe("External | Shared | ORM | Has Many | Basic | instantiating", () => {
  let helper, schema;
  beforeEach(() => {
    helper = new Helper();
    schema = helper.schema;
  });
  afterEach(() => {
    helper.shutdown();
  });

  test("the parent accepts a saved child id", () => {
    let post = helper.savedChild();
    let user = schema.users.new({
      postIds: [post.id],
    });

    expect(user.postIds).toEqual([post.id]);
    expect(user.posts.models[0]).toEqual(post);
  });

  test("the parent errors if the children ids don't exist", () => {
    expect(function () {
      schema.users.new({ postIds: [2] });
    }).toThrow();
  });

  test("the parent accepts null children foreign key", () => {
    let user = schema.users.new({ postIds: null });

    expect(user.posts.models).toHaveLength(0);
    expect(user.postIds).toBeEmpty();
    expect(user.attrs).toEqual({ postIds: null });
  });

  test("the parent accepts saved children", () => {
    let post = helper.savedChild();
    let user = schema.users.new({ posts: [post] });

    expect(user.postIds).toEqual([post.id]);
    expect(user.posts.models[0]).toEqual(post);
  });

  test("the parent accepts new children", () => {
    let post = schema.posts.new({ title: "Lorem" });
    let user = schema.users.new({ posts: [post] });

    expect(user.postIds).toEqual([undefined]);
    expect(user.posts.models[0]).toEqual(post);
  });

  test("the parent accepts null children", () => {
    let user = schema.users.new({ posts: null });

    expect(user.posts.models).toHaveLength(0);
    expect(user.postIds).toBeEmpty();
    expect(user.attrs).toEqual({ postIds: null });
  });

  test("the parent accepts children and child ids", () => {
    let post = helper.savedChild();
    let user = schema.users.new({ posts: [post], postIds: [post.id] });

    expect(user.postIds).toEqual([post.id]);
    expect(user.posts.models[0]).toEqual(post);
  });

  test("the parent accepts no reference to children or child ids as empty obj", () => {
    let user = schema.users.new({});

    expect(user.postIds).toBeEmpty();
    expect(user.posts.models).toBeEmpty();
    expect(user.attrs).toEqual({ postIds: null });
  });

  test("the parent accepts no reference to children or child ids", () => {
    let user = schema.users.new();

    expect(user.postIds).toBeEmpty();
    expect(user.posts.models).toBeEmpty();
    expect(user.attrs).toEqual({ postIds: null });
  });
});
