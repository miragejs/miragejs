import Helper from "./_helper";
import { Model } from "@miragejs/server";
import { module, test } from "qunit";

describe("Integration | ORM | Belongs To | Reflexive | create", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
    this.helper.schema.registerModel("foo", Model);
  });

  test("it sets up associations correctly when passing in the foreign key", assert => {
    let { schema } = this.helper;
    let friend = schema.create("user");
    let user = schema.create("user", {
      userId: friend.id
    });

    friend.reload();

    expect(user.userId).toEqual(friend.id);
    expect(user.user.attrs).toEqual(friend.attrs);
    expect(schema.db.users.length).toEqual(2);
    expect(schema.db.users[0]).toEqual({ id: "1", userId: "2" });
    expect(schema.db.users[1]).toEqual({ id: "2", userId: "1" });
  });

  test("it sets up associations correctly when passing in the association itself", assert => {
    let { schema } = this.helper;
    let friend = schema.create("user");
    let user = schema.create("user", {
      user: friend
    });

    expect(user.userId).toEqual(friend.id);
    expect(user.user.attrs).toEqual(friend.attrs);
    expect(schema.db.users.length).toEqual(2);
    expect(schema.db.users[0]).toEqual({ id: "1", userId: "2" });
    expect(schema.db.users[1]).toEqual({ id: "2", userId: "1" });
  });

  test("it throws an error if a model is passed in without a defined relationship", assert => {
    let { schema } = this.helper;

    expect(function() {
      schema.create("user", {
        foo: schema.create("foo")
      });
    }).toThrow();
  });

  test("it throws an error if a collection is passed in without a defined relationship", assert => {
    let { schema } = this.helper;
    schema.create("foo");
    schema.create("foo");

    expect(function() {
      schema.create("user", {
        foos: schema.foos.all()
      });
    }).toThrow();
  });
});
