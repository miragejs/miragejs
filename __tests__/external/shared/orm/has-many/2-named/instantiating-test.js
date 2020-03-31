import Helper from "./_helper";

describe("External | Shared | ORM | Has Many | Named | instantiating", () => {
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
      blogPostIds: [post.id],
    });

    expect(user.blogPostIds).toEqual([post.id]);
    expect(user.blogPosts.models[0]).toEqual(post);
  });

  test("the parent errors if the children ids don't exist", () => {
    expect(function () {
      schema.users.new({ blogPostIds: [2] });
    }).toThrow();
  });

  test("the parent accepts null children foreign key", () => {
    let user = schema.users.new({ blogPostIds: null });

    expect(user.blogPosts.models).toHaveLength(0);
    expect(user.blogPostIds).toBeEmpty();
    expect(user.attrs).toEqual({ blogPostIds: null });
  });

  test("the parent accepts saved children", () => {
    let post = helper.savedChild();
    let user = schema.users.new({ blogPosts: [post] });

    expect(user.blogPostIds).toEqual([post.id]);
    expect(user.blogPosts.models[0]).toEqual(post);
  });

  test("the parent accepts new children", () => {
    let post = schema.posts.new({ title: "Lorem" });
    let user = schema.users.new({ blogPosts: [post] });

    expect(user.blogPostIds).toEqual([undefined]);
    expect(user.blogPosts.models[0]).toEqual(post);
  });

  test("the parent accepts null children", () => {
    let user = schema.users.new({ blogPosts: null });

    expect(user.blogPosts.models).toHaveLength(0);
    expect(user.blogPostIds).toBeEmpty();
    expect(user.attrs).toEqual({ blogPostIds: null });
  });

  test("the parent accepts children and child ids", () => {
    let post = helper.savedChild();
    let user = schema.users.new({
      blogPosts: [post],
      blogPostIds: [post.id],
    });

    expect(user.blogPostIds).toEqual([post.id]);
    expect(user.blogPosts.models[0]).toEqual(post);
  });

  test("the parent accepts no reference to children or child ids as empty obj", () => {
    let user = schema.users.new({});

    expect(user.blogPostIds).toBeEmpty();
    expect(user.blogPosts.models).toBeEmpty();
    expect(user.attrs).toEqual({ blogPostIds: null });
  });

  test("the parent accepts no reference to children or child ids", () => {
    let user = schema.users.new();

    expect(user.blogPostIds).toBeEmpty();
    expect(user.blogPosts.models).toBeEmpty();
    expect(user.attrs).toEqual({ blogPostIds: null });
  });
});
