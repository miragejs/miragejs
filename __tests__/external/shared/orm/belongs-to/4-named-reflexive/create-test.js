import Helper from "./_helper";
import { Model } from "miragejs";

describe("External | Shared | ORM | Belongs To | Named Reflexive | create", () => {
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
    let friend = schema.create("user");
    let user = schema.create("user", {
      bestFriendId: friend.id,
    });

    friend.reload();

    expect(user.bestFriendId).toEqual(friend.id);
    expect(user.bestFriend.attrs).toEqual(friend.attrs);
    expect(schema.db.users).toHaveLength(2);
    expect(schema.db.users[0]).toEqual({ id: "1", bestFriendId: "2" });
    expect(schema.db.users[1]).toEqual({ id: "2", bestFriendId: "1" });
  });

  test("it sets up associations correctly when passing in the association itself", () => {
    let { schema } = helper;
    let friend = schema.create("user");
    let user = schema.create("user", {
      bestFriend: friend,
    });

    expect(user.bestFriendId).toEqual(friend.id);
    expect(user.bestFriend.attrs).toEqual(friend.attrs);
    expect(schema.db.users).toHaveLength(2);
    expect(schema.db.users[0]).toEqual({ id: "1", bestFriendId: "2" });
    expect(schema.db.users[1]).toEqual({ id: "2", bestFriendId: "1" });
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
