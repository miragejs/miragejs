import Helper from "./_helper";

describe("External | Shared | ORM | Belongs To | Named | instantiating", () => {
  let helper, schema;

  beforeEach(() => {
    helper = new Helper();
    schema = helper.schema;
  });
  afterEach(() => {
    helper.shutdown();
  });

  test("the child accepts a saved parent id", () => {
    let author = helper.savedParent();
    let post = schema.posts.new({ authorId: author.id });

    expect(post.authorId).toEqual(author.id);
    expect(post.author).toEqual(author);
    expect(post.attrs).toEqual({ authorId: author.id });
  });

  test("the child errors if the parent id doesnt exist", () => {
    expect(function () {
      schema.posts.new({ authorId: 2 });
    }).toThrow();
  });

  test("the child accepts a null parent id", () => {
    let post = schema.posts.new({ authorId: null });

    expect(post.authorId).toBeNil();
    expect(post.author).toBeNil();
    expect(post.attrs).toEqual({ authorId: null });
  });

  test("the child accepts a saved parent model", () => {
    let author = helper.savedParent();
    let post = schema.posts.new({ author });

    expect(post.authorId).toBe("1");
    expect(post.author).toEqual(author);
  });

  test("the child accepts a new parent model", () => {
    let zelda = schema.users.new({ name: "Zelda" });
    let post = schema.posts.new({ author: zelda });

    expect(post.authorId).toBeNil();
    expect(post.author).toEqual(zelda);
    expect(post.attrs).toEqual({ authorId: null });
  });

  test("the child accepts a null parent model", () => {
    let post = schema.posts.new({ author: null });

    expect(post.authorId).toBeNil();
    expect(post.author).toBeNil();
    expect(post.attrs).toEqual({ authorId: null });
  });

  test("the child accepts a parent model and id", () => {
    let author = helper.savedParent();
    let post = schema.posts.new({ author, authorId: author.id });

    expect(post.authorId).toBe("1");
    expect(post.author).toEqual(author);
    expect(post.attrs).toEqual({ authorId: author.id });
  });

  test("the child accepts no reference to a parent id or model as empty obj", () => {
    let post = schema.posts.new({});

    expect(post.authorId).toBeNil();
    expect(post.author).toBeNil();
    expect(post.attrs).toEqual({ authorId: null });
  });

  test("the child accepts no reference to a parent id or model", () => {
    let post = schema.posts.new();

    expect(post.authorId).toBeNil();
    expect(post.author).toBeNil();
    expect(post.attrs).toEqual({ authorId: null });
  });
});
