import Helper from "./_helper";
import { Model } from "miragejs";

describe("External | Shared | ORM | Belongs To | One To One | create", () => {
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
    let profile = schema.create("profile");
    let user = schema.create("user", {
      profileId: profile.id,
    });
    profile.reload();

    expect(user.profileId).toEqual(profile.id);
    expect(user.profile.attrs).toEqual(profile.attrs);
    expect(profile.user.attrs).toEqual(user.attrs);
    expect(schema.db.users).toHaveLength(1);
    expect(schema.db.profiles).toHaveLength(1);
    expect(schema.db.users[0]).toEqual({ id: "1", profileId: "1" });
    expect(schema.db.profiles[0]).toEqual({ id: "1", userId: "1" });
  });

  test("it sets up associations correctly when passing in the association itself", () => {
    let { schema } = helper;
    let profile = schema.create("profile");
    let user = schema.create("user", {
      profile,
    });

    expect(user.profileId).toEqual(profile.id);
    expect(user.profile.attrs).toEqual(profile.attrs);
    expect(profile.user.attrs).toEqual(user.attrs);
    expect(schema.db.users).toHaveLength(1);
    expect(schema.db.profiles).toHaveLength(1);
    expect(schema.db.users[0]).toEqual({ id: "1", profileId: "1" });
    expect(schema.db.profiles[0]).toEqual({ id: "1", userId: "1" });
  });

  test("it throws an error if a model is passed in without a defined relationship", () => {
    let { schema } = helper;

    expect(function () {
      schema.create("user", {
        foo: schema.create("foo"),
      });
    }).toThrow();
  });

  test("it throws an error if a collection is passed in without a defined relationship", () => {
    let { schema } = helper;
    schema.create("foo");
    schema.create("foo");

    expect(function () {
      schema.create("user", {
        foos: schema.foos.all(),
      });
    }).toThrow();
  });
});
