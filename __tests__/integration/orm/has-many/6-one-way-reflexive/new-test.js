import Helper from "./_helper";

describe("Integration | ORM | Has Many | One-Way Reflexive | new", () => {
  beforeEach(() =>  {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  });

  test("the parent accepts a saved child id", () => {
    let tagA = this.helper.savedChild();
    let tagB = this.schema.tags.new({
      tagIds: [tagA.id]
    });

    expect(tagB.tagIds).toEqual([tagA.id]);
    expect(tagB.tags.includes(tagA)).toBeTruthy();
  });

  test("the parent errors if the children ids don't exist", () => {
    expect(function() {
      this.schema.tags.new({ tagIds: [2] });
    }).toThrow();
  });

  test("the parent accepts null children foreign key", () => {
    let tag = this.schema.tags.new({ tagIds: null });

    expect(tag.tags.models.length).toEqual(0);
    expect(tag.tagIds).toEqual([]);
    expect(tag.attrs).toEqual({ tagIds: null });
  });

  test("the parent accepts saved children", () => {
    let tagA = this.helper.savedChild();
    let tagB = this.schema.tags.new({ tags: [tagA] });

    expect(tagB.tagIds).toEqual([tagA.id]);
    expect(tagB.tags.models[0]).toEqual(tagA);
  });

  test("the parent accepts new children", () => {
    let tagA = this.schema.tags.new({ color: "Red" });
    let tagB = this.schema.tags.new({ tags: [tagA] });

    expect(tagB.tagIds).toEqual([undefined]);
    expect(tagB.tags.models[0]).toEqual(tagA);
  });

  test("the parent accepts null children", () => {
    let tag = this.schema.tags.new({ tags: null });

    expect(tag.tags.models.length).toEqual(0);
    expect(tag.tagIds).toEqual([]);
    expect(tag.attrs).toEqual({ tagIds: null });
  });

  test("the parent accepts children and child ids", () => {
    let tagA = this.helper.savedChild();
    let tagB = this.schema.tags.new({ tags: [tagA], tagIds: [tagA.id] });

    expect(tagB.tagIds).toEqual([tagA.id]);
    expect(tagB.tags.models[0]).toEqual(tagA);
  });

  test("the parent accepts no reference to children or child ids as empty obj", () => {
    let tag = this.schema.tags.new({});

    expect(tag.tagIds).toEqual([]);
    expect(tag.tags.models).toEqual([]);
    expect(tag.attrs).toEqual({ tagIds: null });
  });

  test("the parent accepts no reference to children or child ids", () => {
    let tag = this.schema.tags.new();

    expect(tag.tagIds).toEqual([]);
    expect(tag.tags.models).toEqual([]);
    expect(tag.attrs).toEqual({ tagIds: null });
  });
});
