import Helper from "./_helper";

describe("External | Shared | ORM | Mixed | One To Many Polymorphic | instantiating", () => {
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
      thingIds: [{ type: "post", id: post.id }],
    });

    expect(user.thingIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.things.includes(post)).toBeTruthy();
  });

  test("the parent errors if the children ids don't exist", () => {
    expect(function () {
      schema.users.new({ thingIds: [{ type: "post", id: 2 }] });
    }).toThrow();
  });

  test("the parent accepts null children foreign key", () => {
    let user = schema.users.new({ thingIds: null });

    expect(user.things.models).toHaveLength(0);
    expect(user.thingIds).toBeEmpty();
    expect(user.attrs).toEqual({ thingIds: null });
  });

  test("the parent accepts saved children", () => {
    let post = helper.savedChild();
    let user = schema.users.new({ things: [post] });

    expect(user.thingIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.things.models[0]).toEqual(post);
  });

  test("the parent accepts new children", () => {
    let post = schema.posts.new({ title: "Lorem" });
    let user = schema.users.new({ things: [post] });

    expect(user.thingIds).toEqual([{ type: "post", id: undefined }]);
    expect(user.things.models[0]).toEqual(post);
  });

  test("the parent accepts null children", () => {
    let user = schema.users.new({ things: null });

    expect(user.things.models).toHaveLength(0);
    expect(user.thingIds).toBeEmpty();
    expect(user.attrs).toEqual({ thingIds: null });
  });

  test("the parent accepts children and child ids", () => {
    let post = helper.savedChild();
    let user = schema.users.new({
      things: [post],
      thingIds: [{ type: "post", id: post.id }],
    });

    expect(user.thingIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.things.models[0]).toEqual(post);
  });

  test("the parent accepts no reference to children or child ids as empty obj", () => {
    let user = schema.users.new({});

    expect(user.thingIds).toBeEmpty();
    expect(user.things.models).toBeEmpty();
    expect(user.attrs).toEqual({ thingIds: null });
  });

  test("the parent accepts no reference to children or child ids", () => {
    let user = schema.users.new();

    expect(user.thingIds).toBeEmpty();
    expect(user.things.models).toBeEmpty();
    expect(user.attrs).toEqual({ thingIds: null });
  });
});
