import Helper from "./_helper";

describe("Integration | ORM | Has Many | Named | instantiating", () => {
  beforeEach(() =>  {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  });

  test("the parent accepts a saved child id", () => {
    let post = this.helper.savedChild();
    let user = this.schema.users.new({
      blogPostIds: [post.id]
    });

    expect(user.blogPostIds).toEqual([post.id]);
    expect(user.blogPosts.models[0]).toEqual(post);
  });

  test("the parent errors if the children ids don't exist", () => {
    expect(function() {
      this.schema.users.new({ blogPostIds: [2] });
    }).toThrow();
  });

  test("the parent accepts null children foreign key", () => {
    let user = this.schema.users.new({ blogPostIds: null });

    expect(user.blogPosts.models.length).toEqual(0);
    expect(user.blogPostIds).toEqual([]);
    expect(user.attrs).toEqual({ blogPostIds: null });
  });

  test("the parent accepts saved children", () => {
    let post = this.helper.savedChild();
    let user = this.schema.users.new({ blogPosts: [post] });

    expect(user.blogPostIds).toEqual([post.id]);
    expect(user.blogPosts.models[0]).toEqual(post);
  });

  test("the parent accepts new children", () => {
    let post = this.schema.posts.new({ title: "Lorem" });
    let user = this.schema.users.new({ blogPosts: [post] });

    expect(user.blogPostIds).toEqual([undefined]);
    expect(user.blogPosts.models[0]).toEqual(post);
  });

  test("the parent accepts null children", () => {
    let user = this.schema.users.new({ blogPosts: null });

    expect(user.blogPosts.models.length).toEqual(0);
    expect(user.blogPostIds).toEqual([]);
    expect(user.attrs).toEqual({ blogPostIds: null });
  });

  test("the parent accepts children and child ids", () => {
    let post = this.helper.savedChild();
    let user = this.schema.users.new({
      blogPosts: [post],
      blogPostIds: [post.id]
    });

    expect(user.blogPostIds).toEqual([post.id]);
    expect(user.blogPosts.models[0]).toEqual(post);
  });

  test("the parent accepts no reference to children or child ids as empty obj", () => {
    let user = this.schema.users.new({});

    expect(user.blogPostIds).toEqual([]);
    expect(user.blogPosts.models).toEqual([]);
    expect(user.attrs).toEqual({ blogPostIds: null });
  });

  test("the parent accepts no reference to children or child ids", () => {
    let user = this.schema.users.new();

    expect(user.blogPostIds).toEqual([]);
    expect(user.blogPosts.models).toEqual([]);
    expect(user.attrs).toEqual({ blogPostIds: null });
  });
});
