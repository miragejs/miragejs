import Helper from "./_helper";

describe("Integration | ORM | Has Many | Basic | instantiating", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
    this.schema = helper.schema;
  });

  test("the parent accepts a saved child id", () => {
    let post = helper.savedChild();
    let user = this.schema.users.new({
      postIds: [post.id]
    });

    expect(user.postIds).toEqual([post.id]);
    expect(user.posts.models[0]).toEqual(post);
  });

  test("the parent errors if the children ids don't exist", () => {
    expect(function() {
      this.schema.users.new({ postIds: [2] });
    }).toThrow();
  });

  test("the parent accepts null children foreign key", () => {
    let user = this.schema.users.new({ postIds: null });

    expect(user.posts.models).toHaveLength(0);
    expect(user.postIds).toBeEmpty();
    expect(user.attrs).toEqual({ postIds: null });
  });

  test("the parent accepts saved children", () => {
    let post = helper.savedChild();
    let user = this.schema.users.new({ posts: [post] });

    expect(user.postIds).toEqual([post.id]);
    expect(user.posts.models[0]).toEqual(post);
  });

  test("the parent accepts new children", () => {
    let post = this.schema.posts.new({ title: "Lorem" });
    let user = this.schema.users.new({ posts: [post] });

    expect(user.postIds).toEqual([undefined]);
    expect(user.posts.models[0]).toEqual(post);
  });

  test("the parent accepts null children", () => {
    let user = this.schema.users.new({ posts: null });

    expect(user.posts.models).toHaveLength(0);
    expect(user.postIds).toBeEmpty();
    expect(user.attrs).toEqual({ postIds: null });
  });

  test("the parent accepts children and child ids", () => {
    let post = helper.savedChild();
    let user = this.schema.users.new({ posts: [post], postIds: [post.id] });

    expect(user.postIds).toEqual([post.id]);
    expect(user.posts.models[0]).toEqual(post);
  });

  test("the parent accepts no reference to children or child ids as empty obj", () => {
    let user = this.schema.users.new({});

    expect(user.postIds).toBeEmpty();
    expect(user.posts.models).toBeEmpty();
    expect(user.attrs).toEqual({ postIds: null });
  });

  test("the parent accepts no reference to children or child ids", () => {
    let user = this.schema.users.new();

    expect(user.postIds).toBeEmpty();
    expect(user.posts.models).toBeEmpty();
    expect(user.attrs).toEqual({ postIds: null });
  });
});
