import Helper from "./_helper";

describe("Integration | ORM | Has Many | Named Reflexive Explicit Inverse | new", () => {
  beforeEach(() => {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  });

  test("the parent accepts a saved child id", () => {
    let tagA = this.helper.savedChild();
    let tagB = this.schema.tags.new({
      labelIds: [tagA.id]
    });

    expect(tagB.labelIds).toEqual([tagA.id]);
    expect(tagB.labels.includes(tagA)).toBeTruthy();
  });

  test("the parent errors if the children ids don't exist", () => {
    expect(function() {
      this.schema.tags.new({ labelIds: [2] });
    }).toThrow();
  });

  test("the parent accepts null children foreign key", () => {
    let tag = this.schema.tags.new({ labelIds: null });

    expect(tag.labels.models.length).toEqual(0);
    expect(tag.labelIds).toBeEmpty();
    expect(tag.attrs).toEqual({ labelIds: null });
  });

  test("the parent accepts saved children", () => {
    let tagA = this.helper.savedChild();
    let tagB = this.schema.tags.new({ labels: [tagA] });

    expect(tagB.labelIds).toEqual([tagA.id]);
    expect(tagB.labels.models[0]).toEqual(tagA);
  });

  test("the parent accepts new children", () => {
    let tagA = this.schema.tags.new({ color: "Red" });
    let tagB = this.schema.tags.new({ labels: [tagA] });

    expect(tagB.labelIds).toEqual([undefined]);
    expect(tagB.labels.models[0]).toEqual(tagA);
  });

  test("the parent accepts null children", () => {
    let tag = this.schema.tags.new({ labels: null });

    expect(tag.labels.models.length).toEqual(0);
    expect(tag.labelIds).toBeEmpty();
    expect(tag.attrs).toEqual({ labelIds: null });
  });

  test("the parent accepts children and child ids", () => {
    let tagA = this.helper.savedChild();
    let tagB = this.schema.tags.new({ labels: [tagA], labelIds: [tagA.id] });

    expect(tagB.labelIds).toEqual([tagA.id]);
    expect(tagB.labels.models[0]).toEqual(tagA);
  });

  test("the parent accepts no reference to children or child ids as empty obj", () => {
    let tag = this.schema.tags.new({});

    expect(tag.labelIds).toBeEmpty();
    expect(tag.labels.models).toBeEmpty();
    expect(tag.attrs).toEqual({ labelIds: null });
  });

  test("the parent accepts no reference to children or child ids", () => {
    let tag = this.schema.tags.new();

    expect(tag.labelIds).toBeEmpty();
    expect(tag.labels.models).toBeEmpty();
    expect(tag.attrs).toEqual({ labelIds: null });
  });
});
