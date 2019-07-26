import Helper from "./_helper";

describe("Integration | ORM | Belongs To | Named | instantiating", () => {
  beforeEach(() =>  {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  });

  test("the child accepts a saved parent id", () => {
    let author = this.helper.savedParent();
    let post = this.schema.posts.new({ authorId: author.id });

    expect(post.authorId).toEqual(author.id);
    expect(post.author).toEqual(author);
    expect(post.attrs).toEqual({ authorId: author.id });
  });

  test("the child errors if the parent id doesnt exist", () => {
    expect(function() {
      this.schema.posts.new({ authorId: 2 });
    }).toThrow();
  });

  test("the child accepts a null parent id", () => {
    let post = this.schema.posts.new({ authorId: null });

    expect(post.authorId).toEqual(null);
    expect(post.author).toEqual(null);
    expect(post.attrs).toEqual({ authorId: null });
  });

  test("the child accepts a saved parent model", () => {
    let author = this.helper.savedParent();
    let post = this.schema.posts.new({ author });

    expect(post.authorId).toEqual(1);
    expect(post.author).toEqual(author);
  });

  test("the child accepts a new parent model", () => {
    let zelda = this.schema.users.new({ name: "Zelda" });
    let post = this.schema.posts.new({ author: zelda });

    expect(post.authorId).toEqual(null);
    expect(post.author).toEqual(zelda);
    expect(post.attrs).toEqual({ authorId: null });
  });

  test("the child accepts a null parent model", () => {
    let post = this.schema.posts.new({ author: null });

    expect(post.authorId).toEqual(null);
    expect(post.author).toEqual(null);
    expect(post.attrs).toEqual({ authorId: null });
  });

  test("the child accepts a parent model and id", () => {
    let author = this.helper.savedParent();
    let post = this.schema.posts.new({ author, authorId: author.id });

    expect(post.authorId).toEqual("1");
    expect(post.author).toEqual(author);
    expect(post.attrs).toEqual({ authorId: author.id });
  });

  test("the child accepts no reference to a parent id or model as empty obj", () => {
    let post = this.schema.posts.new({});

    expect(post.authorId).toEqual(null);
    expect(post.author).toEqual(null);
    expect(post.attrs).toEqual({ authorId: null });
  });

  test("the child accepts no reference to a parent id or model", () => {
    let post = this.schema.posts.new();

    expect(post.authorId).toEqual(null);
    expect(post.author).toEqual(null);
    expect(post.attrs).toEqual({ authorId: null });
  });
});
