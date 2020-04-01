import Helper from "./_helper";

describe("External | Shared | ORM | Has Many | Named Reflexive Explicit Inverse | new", () => {
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
      labelIds: [tagA.id],
    });

    expect(tagB.labelIds).toEqual([tagA.id]);
    expect(tagB.labels.includes(tagA)).toBeTruthy();
  });

  test("the parent errors if the children ids don't exist", () => {
    expect(function () {
      schema.tags.new({ labelIds: [2] });
    }).toThrow();
  });

  test("the parent accepts null children foreign key", () => {
    let tag = schema.tags.new({ labelIds: null });

    expect(tag.labels.models).toHaveLength(0);
    expect(tag.labelIds).toBeEmpty();
    expect(tag.attrs).toEqual({ labelIds: null });
  });

  test("the parent accepts saved children", () => {
    let tagA = helper.savedChild();
    let tagB = schema.tags.new({ labels: [tagA] });

    expect(tagB.labelIds).toEqual([tagA.id]);
    expect(tagB.labels.models[0]).toEqual(tagA);
  });

  test("the parent accepts new children", () => {
    let tagA = schema.tags.new({ color: "Red" });
    let tagB = schema.tags.new({ labels: [tagA] });

    expect(tagB.labelIds).toEqual([undefined]);
    expect(tagB.labels.models[0]).toEqual(tagA);
  });

  test("the parent accepts null children", () => {
    let tag = schema.tags.new({ labels: null });

    expect(tag.labels.models).toHaveLength(0);
    expect(tag.labelIds).toBeEmpty();
    expect(tag.attrs).toEqual({ labelIds: null });
  });

  test("the parent accepts children and child ids", () => {
    let tagA = helper.savedChild();
    let tagB = schema.tags.new({ labels: [tagA], labelIds: [tagA.id] });

    expect(tagB.labelIds).toEqual([tagA.id]);
    expect(tagB.labels.models[0]).toEqual(tagA);
  });

  test("the parent accepts no reference to children or child ids as empty obj", () => {
    let tag = schema.tags.new({});

    expect(tag.labelIds).toBeEmpty();
    expect(tag.labels.models).toBeEmpty();
    expect(tag.attrs).toEqual({ labelIds: null });
  });

  test("the parent accepts no reference to children or child ids", () => {
    let tag = schema.tags.new();

    expect(tag.labelIds).toBeEmpty();
    expect(tag.labels.models).toBeEmpty();
    expect(tag.attrs).toEqual({ labelIds: null });
  });
});
