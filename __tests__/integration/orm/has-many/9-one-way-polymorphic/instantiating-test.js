import Helper from "./_helper";

describe("Integration | ORM | Has Many | One-way Polymorphic | instantiating", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
    this.schema = helper.schema;
  });

  test("the parent accepts a saved child id", () => {
    let post = helper.savedChild();
    let user = this.schema.users.new({
      thingIds: [{ type: "post", id: post.id }]
    });

    expect(user.thingIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.things.includes(post)).toBeTruthy();
  });

  test("the parent errors if the children ids don't exist", () => {
    expect(function() {
      this.schema.users.new({ thingIds: [{ type: "post", id: 2 }] });
    }).toThrow();
  });

  test("the parent accepts null children foreign key", () => {
    let user = this.schema.users.new({ thingIds: null });

    expect(user.things.models).toHaveLength(0);
    expect(user.thingIds).toBeEmpty();
    expect(user.attrs).toEqual({ thingIds: null });
  });

  test("the parent accepts saved children", () => {
    let post = helper.savedChild();
    let user = this.schema.users.new({ things: [post] });

    expect(user.thingIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.things.includes(post)).toBeTruthy();
  });

  test("the parent accepts new children", () => {
    let post = this.schema.posts.new({ title: "Lorem" });
    let user = this.schema.users.new({ things: [post] });

    expect(user.thingIds).toEqual([{ type: "post", id: undefined }]);
    expect(user.things.includes(post)).toBeTruthy();
  });

  test("the parent accepts null children", () => {
    let user = this.schema.users.new({ things: null });

    expect(user.things.models).toHaveLength(0);
    expect(user.thingIds).toBeEmpty();
    expect(user.attrs).toEqual({ thingIds: null });
  });

  test("the parent accepts children and child ids", () => {
    let post = helper.savedChild();
    let user = this.schema.users.new({
      things: [post],
      thingIds: [{ type: "post", id: post.id }]
    });

    expect(user.thingIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.things.includes(post)).toBeTruthy();
  });

  test("the parent accepts no reference to children or child ids as empty obj", () => {
    let user = this.schema.users.new({});

    expect(user.thingIds).toBeEmpty();
    expect(user.things.models).toBeEmpty();
    expect(user.attrs).toEqual({ thingIds: null });
  });

  test("the parent accepts no reference to children or child ids", () => {
    let user = this.schema.users.new();

    expect(user.thingIds).toBeEmpty();
    expect(user.things.models).toBeEmpty();
    expect(user.attrs).toEqual({ thingIds: null });
  });
});
