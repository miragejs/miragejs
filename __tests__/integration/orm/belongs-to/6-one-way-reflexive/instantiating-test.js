import Helper from "./_helper";

describe("Integration | ORM | Belongs To | One-Way Reflexive | instantiating", () => {
  beforeEach(() => {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  });

  test("the child accepts a saved parent id", () => {
    let parent = this.helper.savedParent();
    let child = this.schema.users.new({ userId: parent.id });

    expect(child.userId).toEqual(parent.id);
    expect(child.user.attrs).toEqual(parent.attrs);
    expect(child.attrs).toEqual({ userId: parent.id });
  });

  test("the child errors if the parent id doesnt exist", () => {
    expect(function() {
      this.schema.users.new({ userId: 2 });
    }).toThrow();
  });

  test("the child accepts a null parent id", () => {
    let child = this.schema.users.new({ userId: null });

    expect(child.userId).toEqual(null);
    expect(child.user).toEqual(null);
    expect(child.attrs).toEqual({ userId: null });
  });

  test("the child accepts a saved parent model", () => {
    let parent = this.helper.savedParent();
    let child = this.schema.users.new({ user: parent });

    expect(child.userId).toEqual(1);
    expect(child.user.attrs).toEqual(parent.attrs);
  });

  test("the child accepts a new parent model", () => {
    let zelda = this.schema.users.new({ name: "Zelda" });
    let child = this.schema.users.new({ user: zelda });

    expect(child.userId).toEqual(null);
    expect(child.user).toEqual(zelda);
    expect(child.attrs).toEqual({ userId: null });
  });

  test("the child accepts a null parent model", () => {
    let child = this.schema.users.new({ user: null });

    expect(child.userId).toEqual(null);
    expect(child.user).toEqual(null);
    expect(child.attrs).toEqual({ userId: null });
  });

  test("the child accepts a parent model and id", () => {
    let parent = this.helper.savedParent();
    let child = this.schema.users.new({ user: parent, userId: parent.id });

    expect(child.userId).toEqual("1");
    expect(child.user.attrs).toEqual(parent.attrs);
    expect(child.attrs).toEqual({ userId: parent.id });
  });

  test("the child accepts no reference to a parent id or model as empty obj", () => {
    let child = this.schema.users.new({});

    expect(child.userId).toEqual(null);
    expect(child.user).toEqual(null);
    expect(child.attrs).toEqual({ userId: null });
  });

  test("the child accepts no reference to a parent id or model", () => {
    let child = this.schema.users.new();

    expect(child.userId).toEqual(null);
    expect(child.user).toEqual(null);
    expect(child.attrs).toEqual({ userId: null });
  });
});
