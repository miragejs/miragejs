import Helper from "./_helper";
import { Model } from "miragejs";

describe("External | Shared | ORM | Has Many | One-Way Reflexive | create", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
    helper.schema.registerModel("foo", Model);
  });
  afterEach(() => {
    helper.shutdown();
  });

  test("it sets up associations correctly when passing in the foreign key", () => {
    let { schema } = helper;
    let tagA = schema.tags.create();
    let tagB = schema.tags.create({
      tagIds: [tagA.id],
    });

    tagA.reload();

    expect(tagB.tagIds).toEqual([tagA.id]);
    expect(tagA.tagIds).toBeEmpty();
    expect(tagB.attrs.tagIds).toEqual([tagA.id]);
    expect(tagB.tags.models[0].attrs).toEqual(tagA.attrs);
    expect(helper.db.tags).toHaveLength(2);
    expect(helper.db.tags[0]).toEqual({ id: "1", tagIds: null });
    expect(helper.db.tags[1]).toEqual({ id: "2", tagIds: ["1"] });
  });

  test("it sets up associations correctly when passing in an array of models", () => {
    let { schema } = helper;
    let tagA = schema.tags.create();
    let tagB = schema.tags.create({
      tags: [tagA],
    });

    tagA.reload();

    expect(tagB.tagIds).toEqual([tagA.id]);
    expect(tagA.tagIds).toBeEmpty();
    expect(tagB.attrs.tagIds).toEqual([tagA.id]);
    expect(tagA.attrs.tagIds).toBeNull();
    expect(helper.db.tags).toHaveLength(2);
  });

  test("it sets up associations correctly when passing in a collection", () => {
    let { schema } = helper;
    let tagA = schema.tags.create();
    let tagB = schema.tags.create({
      tags: schema.tags.all(),
    });

    tagA.reload();

    expect(tagB.tagIds).toEqual([tagA.id]);
    expect(tagA.tagIds).toBeEmpty();
    expect(tagB.attrs.tagIds).toEqual([tagA.id]);
    expect(tagA.attrs.tagIds).toBeNull();
    expect(helper.db.tags).toHaveLength(2);
  });

  test("it throws an error if a model is passed in without a defined relationship", () => {
    let { schema } = helper;

    expect(function () {
      schema.tags.create({
        foo: schema.create("foo"),
      });
    }).toThrow();
  });

  test("it throws an error if an array of models is passed in without a defined relationship", () => {
    let { schema } = helper;

    expect(function () {
      schema.tags.create({
        foos: [schema.create("foo")],
      });
    }).toThrow();
  });

  test("it throws an error if a collection is passed in without a defined relationship", () => {
    let { schema } = helper;
    schema.foos.create();
    schema.foos.create();

    expect(function () {
      schema.tags.create({
        foos: schema.foos.all(),
      });
    }).toThrow();
  });
});
