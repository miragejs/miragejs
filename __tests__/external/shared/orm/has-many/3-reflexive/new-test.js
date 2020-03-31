import Helper from "./_helper";

describe("External | Shared | ORM | Has Many | Reflexive | new", () => {
  let helper, schema;
  beforeEach(() => {
    helper = new Helper();
    schema = helper.schema;
  });
  afterEach(() => {
    helper.shutdown();
  });

  test("the parent accepts a saved child id", () => {
    let tagA = helper.savedChild();
    let tagB = schema.tags.new({
      tagIds: [tagA.id],
    });

    expect(tagB.tagIds).toEqual([tagA.id]);
    expect(tagB.tags.includes(tagA)).toBeTruthy();
  });

  test("the parent errors if the children ids don't exist", () => {
    expect(function () {
      schema.tags.new({ tagIds: [2] });
    }).toThrow();
  });

  test("the parent accepts null children foreign key", () => {
    let tag = schema.tags.new({ tagIds: null });

    expect(tag.tags.models).toHaveLength(0);
    expect(tag.tagIds).toBeEmpty();
    expect(tag.attrs).toEqual({ tagIds: null });
  });

  test("the parent accepts saved children", () => {
    let tagA = helper.savedChild();
    let tagB = schema.tags.new({ tags: [tagA] });

    expect(tagB.tagIds).toEqual([tagA.id]);
    expect(tagB.tags.models[0]).toEqual(tagA);
  });

  test("the parent accepts new children", () => {
    let tagA = schema.tags.new({ color: "Red" });
    let tagB = schema.tags.new({ tags: [tagA] });

    expect(tagB.tagIds).toEqual([undefined]);
    expect(tagB.tags.models[0]).toEqual(tagA);
  });

  test("the parent accepts null children", () => {
    let tag = schema.tags.new({ tags: null });

    expect(tag.tags.models).toHaveLength(0);
    expect(tag.tagIds).toBeEmpty();
    expect(tag.attrs).toEqual({ tagIds: null });
  });

  test("the parent accepts children and child ids", () => {
    let tagA = helper.savedChild();
    let tagB = schema.tags.new({ tags: [tagA], tagIds: [tagA.id] });

    expect(tagB.tagIds).toEqual([tagA.id]);
    expect(tagB.tags.models[0]).toEqual(tagA);
  });

  test("the parent accepts no reference to children or child ids as empty obj", () => {
    let tag = schema.tags.new({});

    expect(tag.tagIds).toBeEmpty();
    expect(tag.tags.models).toBeEmpty();
    expect(tag.attrs).toEqual({ tagIds: null });
  });

  test("the parent accepts no reference to children or child ids", () => {
    let tag = schema.tags.new();

    expect(tag.tagIds).toBeEmpty();
    expect(tag.tags.models).toBeEmpty();
    expect(tag.attrs).toEqual({ tagIds: null });
  });
});
