import Helper from "./_helper";

describe("Integration | ORM | Belongs To | One-way Polymorphic | instantiating", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
    this.schema = helper.schema;
  });

  test("the child accepts a saved parent id", () => {
    let post = helper.savedParent();
    let comment = this.schema.comments.new({
      commentableId: { id: post.id, type: "post" }
    });

    expect(comment.commentableId).toEqual({ id: post.id, type: "post" });
    expect(comment.commentable).toEqual(post);
    expect(comment.attrs).toEqual({
      commentableId: { id: post.id, type: "post" }
    });
  });

  test("the child errors if the parent id doesnt exist", () => {
    expect(function() {
      this.schema.comments.new({ commentableId: { type: "post", id: 2 } });
    }).toThrow();
  });

  test("the child accepts a null parent id", () => {
    let comment = this.schema.comments.new({ commentableId: null });

    expect(comment.commentableId).toBeNull();
    expect(comment.commentable).toBeNull();
    expect(comment.attrs).toEqual({ commentableId: null });
  });

  test("the child accepts a saved parent model", () => {
    let post = helper.savedParent();
    let comment = this.schema.comments.new({ commentable: post });

    expect(comment.commentableId).toEqual({ type: "post", id: post.id });
    expect(comment.commentable).toEqual(post);
  });

  test("the child accepts a new parent model", () => {
    let post = this.schema.posts.new({ text: "foo" });
    let comment = this.schema.comments.new({ commentable: post });

    expect(comment.commentableId).toEqual({ type: "post", id: undefined });
    expect(comment.commentable).toEqual(post);
    expect(comment.attrs).toEqual({ commentableId: null });
  });

  test("the child accepts a null parent model", () => {
    let comment = this.schema.comments.new({ commentable: null });

    expect(comment.commentableId).toBeNull();
    expect(comment.commentable).toBeNull();
    expect(comment.attrs).toEqual({ commentableId: null });
  });

  test("the child accepts a parent model and id", () => {
    let post = helper.savedParent();
    let comment = this.schema.comments.new({
      commentable: post,
      commentableId: { type: "post", id: post.id }
    });

    expect(comment.commentableId).toEqual({ type: "post", id: "1" });
    expect(comment.commentable).toEqual(post);
    expect(comment.attrs).toEqual({
      commentableId: { type: "post", id: post.id }
    });
  });

  test("the child accepts no reference to a parent id or model as empty obj", () => {
    let comment = this.schema.comments.new({});

    expect(comment.commentableId).toBeNull();
    expect(comment.commentable).toBeNull();
    expect(comment.attrs).toEqual({ commentableId: null });
  });

  test("the child accepts no reference to a parent id or model", () => {
    let comment = this.schema.comments.new();

    expect(comment.commentableId).toBeNull();
    expect(comment.commentable).toBeNull();
    expect(comment.attrs).toEqual({ commentableId: null });
  });
});
