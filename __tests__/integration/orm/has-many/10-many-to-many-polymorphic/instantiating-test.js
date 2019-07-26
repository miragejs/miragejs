import Helper from "./_helper";

describe("Integration | ORM | Has Many | Many-to-many Polymorphic | instantiating", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  });

  test("the parent accepts a saved child id", () => {
    let post = this.helper.savedChild();
    let user = this.schema.users.new({
      commentableIds: [{ type: "post", id: post.id }]
    });

    expect(user.commentableIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.commentables.includes(post)).toBeTruthy();
  });

  test("the parent errors if the children ids don't exist", () => {
    expect(function() {
      this.schema.users.new({ commentableIds: [{ type: "post", id: 2 }] });
    }).toThrow();
  });

  test("the parent accepts null children foreign key", () => {
    let user = this.schema.users.new({ commentableIds: null });

    expect(user.commentables.models.length).toEqual(0);
    expect(user.commentableIds).toEqual([]);
    expect(user.attrs).toEqual({ commentableIds: null });
  });

  test("the parent accepts saved children", () => {
    let post = this.helper.savedChild();
    let user = this.schema.users.new({ commentables: [post] });

    expect(user.commentableIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.commentables.includes(post)).toBeTruthy();
  });

  test("the parent accepts new children", () => {
    let post = this.schema.posts.new({ title: "Lorem" });
    let user = this.schema.users.new({ commentables: [post] });

    expect(user.commentableIds).toEqual([{ type: "post", id: undefined }]);
    expect(user.commentables.includes(post)).toBeTruthy();
  });

  test("the parent accepts null children", () => {
    let user = this.schema.users.new({ commentables: null });

    expect(user.commentables.models.length).toEqual(0);
    expect(user.commentableIds).toEqual([]);
    expect(user.attrs).toEqual({ commentableIds: null });
  });

  test("the parent accepts children and child ids", () => {
    let post = this.helper.savedChild();
    let user = this.schema.users.new({
      commentables: [post],
      commentableIds: [{ type: "post", id: post.id }]
    });

    expect(user.commentableIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.commentables.includes(post)).toBeTruthy();
  });

  test("the parent accepts no reference to children or child ids as empty obj", () => {
    let user = this.schema.users.new({});

    expect(user.commentableIds).toEqual([]);
    expect(user.commentables.models).toEqual([]);
    expect(user.attrs).toEqual({ commentableIds: null });
  });

  test("the parent accepts no reference to children or child ids", () => {
    let user = this.schema.users.new();

    expect(user.commentableIds).toEqual([]);
    expect(user.commentables.models).toEqual([]);
    expect(user.attrs).toEqual({ commentableIds: null });
  });
});
