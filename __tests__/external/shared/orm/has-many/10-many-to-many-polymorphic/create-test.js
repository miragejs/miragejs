import Helper from "./_helper";

describe("External | Shared | ORM | Has Many | Many-to-many Polymorphic | create", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  test("it sets up associations correctly when passing in the foreign key", () => {
    let post = helper.schema.create("post");
    let user = helper.schema.create("user", {
      commentableIds: [{ type: "post", id: post.id }],
    });

    post.reload();

    expect(user.commentableIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.attrs.commentableIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.commentables.models[0].attrs).toEqual(post.attrs);
    expect(helper.db.posts).toHaveLength(1);
    expect(helper.db.users).toHaveLength(1);
    expect(helper.db.posts[0]).toEqual({ id: "1", userIds: ["1"] });
    expect(helper.db.users[0]).toEqual({
      id: "1",
      commentableIds: [{ type: "post", id: "1" }],
    });
  });

  test("it sets up associations correctly when passing in an array of models", () => {
    let post = helper.schema.create("post");
    let user = helper.schema.create("user", {
      commentables: [post],
    });

    post.reload();

    expect(user.commentableIds).toEqual([{ type: "post", id: post.id }]);
    expect(post.userIds).toEqual(["1"]);
    expect(user.attrs.commentableIds).toEqual([{ type: "post", id: post.id }]);
    expect(post.attrs.userIds).toEqual([user.id]);
    expect(helper.db.users).toHaveLength(1);
    expect(helper.db.posts).toHaveLength(1);
  });

  test("it sets up associations correctly when passing in a collection", () => {
    let post = helper.schema.create("post");
    let user = helper.schema.create("user", {
      commentables: helper.schema.posts.all(),
    });

    post.reload();

    expect(user.commentableIds).toEqual([{ type: "post", id: post.id }]);
    expect(post.userIds).toEqual([user.id]);
    expect(user.attrs.commentableIds).toEqual([{ type: "post", id: post.id }]);
    expect(post.attrs.userIds).toEqual([user.id]);
    expect(helper.db.users).toHaveLength(1);
    expect(helper.db.posts).toHaveLength(1);
  });
});
