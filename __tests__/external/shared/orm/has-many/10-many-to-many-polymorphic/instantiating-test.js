import Helper from "./_helper";

describe("External | Shared | ORM | Has Many | Many-to-many Polymorphic | instantiating", () => {
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
      commentableIds: [{ type: "post", id: post.id }],
    });

    expect(user.commentableIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.commentables.includes(post)).toBeTruthy();
  });

  test("the parent errors if the children ids don't exist", () => {
    expect(function () {
      schema.users.new({ commentableIds: [{ type: "post", id: 2 }] });
    }).toThrow();
  });

  test("the parent accepts null children foreign key", () => {
    let user = schema.users.new({ commentableIds: null });

    expect(user.commentables.models).toHaveLength(0);
    expect(user.commentableIds).toBeEmpty();
    expect(user.attrs).toEqual({ commentableIds: null });
  });

  test("the parent accepts saved children", () => {
    let post = helper.savedChild();
    let user = schema.users.new({ commentables: [post] });

    expect(user.commentableIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.commentables.includes(post)).toBeTruthy();
  });

  test("the parent accepts new children", () => {
    let post = schema.posts.new({ title: "Lorem" });
    let user = schema.users.new({ commentables: [post] });

    expect(user.commentableIds).toEqual([{ type: "post", id: undefined }]);
    expect(user.commentables.includes(post)).toBeTruthy();
  });

  test("the parent accepts null children", () => {
    let user = schema.users.new({ commentables: null });

    expect(user.commentables.models).toHaveLength(0);
    expect(user.commentableIds).toBeEmpty();
    expect(user.attrs).toEqual({ commentableIds: null });
  });

  test("the parent accepts children and child ids", () => {
    let post = helper.savedChild();
    let user = schema.users.new({
      commentables: [post],
      commentableIds: [{ type: "post", id: post.id }],
    });

    expect(user.commentableIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.commentables.includes(post)).toBeTruthy();
  });

  test("the parent accepts no reference to children or child ids as empty obj", () => {
    let user = schema.users.new({});

    expect(user.commentableIds).toBeEmpty();
    expect(user.commentables.models).toBeEmpty();
    expect(user.attrs).toEqual({ commentableIds: null });
  });

  test("the parent accepts no reference to children or child ids", () => {
    let user = schema.users.new();

    expect(user.commentableIds).toBeEmpty();
    expect(user.commentables.models).toBeEmpty();
    expect(user.attrs).toEqual({ commentableIds: null });
  });
});
