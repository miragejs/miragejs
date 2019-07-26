import Helper from "./_helper";

describe("Integration | ORM | Mixed | One To Many | instantiating", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  });

  test("the parent accepts a saved child id", () => {
    let post = this.helper.savedChild();
    let user = this.schema.users.new({
      postIds: [post.id]
    });

    expect(user.postIds).toEqual([post.id]);
    expect(user.posts.includes(post)).toBeTruthy();
  });

  test("the parent errors if the children ids don't exist", () => {
    expect(function() {
      this.schema.users.new({ postIds: [2] });
    }).toThrow();
  });

  test("the parent accepts null children foreign key", () => {
    let user = this.schema.users.new({ postIds: null });

    expect(user.posts.models.length).toEqual(0);
    expect(user.postIds).toEqual([]);
    expect(user.attrs).toEqual({ postIds: null });
  });

  test("the parent accepts saved children", () => {
    let post = this.helper.savedChild();
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

    expect(user.posts.models.length).toEqual(0);
    expect(user.postIds).toEqual([]);
    expect(user.attrs).toEqual({ postIds: null });
  });

  test("the parent accepts children and child ids", () => {
    let post = this.helper.savedChild();
    let user = this.schema.users.new({ posts: [post], postIds: [post.id] });

    expect(user.postIds).toEqual([post.id]);
    expect(user.posts.models[0]).toEqual(post);
  });

  test("the parent accepts no reference to children or child ids as empty obj", () => {
    let user = this.schema.users.new({});

    expect(user.postIds).toEqual([]);
    expect(user.posts.models).toEqual([]);
    expect(user.attrs).toEqual({ postIds: null });
  });

  test("the parent accepts no reference to children or child ids", () => {
    let user = this.schema.users.new();

    expect(user.postIds).toEqual([]);
    expect(user.posts.models).toEqual([]);
    expect(user.attrs).toEqual({ postIds: null });
  });
});
