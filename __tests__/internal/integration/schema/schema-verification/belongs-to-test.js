import "@lib/container";
import Db from "@lib/db";
import Schema from "@lib/orm/schema";
import { Model, belongsTo } from "@miragejs/server";

describe("Internal | Integration | Schema | Schema Verification | Belongs To", function() {
  test("a one-way belongsTo association is correct", () => {
    let schema = new Schema(
      new Db({
        authors: [{ id: 1, name: "Frodo" }],
        posts: [{ id: 1, title: "Lorem ipsum" }]
      }),
      {
        author: Model.extend(),
        post: Model.extend({
          author: belongsTo()
        })
      }
    );

    let post = schema.posts.find(1);
    let association = post.associationFor("author");
    let frodo = schema.authors.find(1);

    expect(association.key).toEqual("author");
    expect(association.modelName).toEqual("author");
    expect(association.ownerModelName).toEqual("post");
    expect(frodo.inverseFor(association) === null).toBeTruthy();
  });

  test("a one-way named belongsTo association is correct", () => {
    let schema = new Schema(
      new Db({
        users: [{ id: 1, name: "Frodo" }],
        posts: [{ id: 1, title: "Lorem ipsum" }]
      }),
      {
        user: Model.extend(),
        post: Model.extend({
          author: belongsTo("user")
        })
      }
    );

    let post = schema.posts.find(1);
    let association = post.associationFor("author");
    let frodo = schema.users.find(1);

    expect(association.key).toEqual("author");
    expect(association.modelName).toEqual("user");
    expect(association.ownerModelName).toEqual("post");
    expect(frodo.inverseFor(association) === null).toBeTruthy();
  });

  test("a reflexive belongsTo association is correct and has an implicit inverse", () => {
    let schema = new Schema(
      new Db({
        users: [{ id: 1, name: "Frodo" }]
      }),
      {
        user: Model.extend({
          user: belongsTo()
        })
      }
    );

    let frodo = schema.users.find(1);
    let association = frodo.associationFor("user");

    expect(association.key).toEqual("user");
    expect(association.modelName).toEqual("user");
    expect(association.ownerModelName).toEqual("user");
    expect(frodo.inverseFor(association) === association).toBeTruthy();
  });

  test("a named reflexive belongsTo association with an implicit inverse is correct", () => {
    let schema = new Schema(
      new Db({
        users: [{ id: 1, name: "Frodo" }]
      }),
      {
        user: Model.extend({
          bestFriend: belongsTo("user")
        })
      }
    );

    let frodo = schema.users.find(1);
    let association = frodo.associationFor("bestFriend");

    expect(association.key).toEqual("bestFriend");
    expect(association.modelName).toEqual("user");
    expect(association.ownerModelName).toEqual("user");
    expect(frodo.inverseFor(association) === association).toBeTruthy();
  });

  test("a named reflexive belongsTo association with an explicit inverse is correct", () => {
    let schema = new Schema(
      new Db({
        users: [{ id: 1, name: "Frodo" }]
      }),
      {
        user: Model.extend({
          bestFriend: belongsTo("user", { inverse: "bestFriend" })
        })
      }
    );

    let frodo = schema.users.find(1);
    let association = frodo.associationFor("bestFriend");

    expect(association.key).toEqual("bestFriend");
    expect(association.modelName).toEqual("user");
    expect(association.ownerModelName).toEqual("user");
    expect(frodo.inverseFor(association) === association).toBeTruthy();
  });

  test("a one-way reflexive belongsTo association with a null inverse is correct", () => {
    let schema = new Schema(
      new Db({
        users: [{ id: 1, name: "Frodo" }]
      }),
      {
        user: Model.extend({
          user: belongsTo("user", { inverse: null })
        })
      }
    );

    let frodo = schema.users.find(1);
    let association = frodo.associationFor("user");

    expect(association.key).toEqual("user");
    expect(association.modelName).toEqual("user");
    expect(association.ownerModelName).toEqual("user");
    expect(frodo.inverseFor(association) === null).toBeTruthy();
  });

  test("a named one-way way reflexive belongsTo association with a null inverse is correct", () => {
    let schema = new Schema(
      new Db({
        users: [{ id: 1, name: "Frodo" }]
      }),
      {
        user: Model.extend({
          parent: belongsTo("user", { inverse: null })
        })
      }
    );

    let frodo = schema.users.find(1);
    let association = frodo.associationFor("parent");

    expect(association.key).toEqual("parent");
    expect(association.modelName).toEqual("user");
    expect(association.ownerModelName).toEqual("user");
    expect(frodo.inverseFor(association) === null).toBeTruthy();
  });

  test("a one-to-one belongsTo association with an implicit inverse is correct", () => {
    let schema = new Schema(
      new Db({
        users: [{ id: 1, name: "Frodo" }],
        profiles: [{ id: 1, type: "Admin" }]
      }),
      {
        user: Model.extend({
          profile: belongsTo()
        }),
        profile: Model.extend({
          user: belongsTo()
        })
      }
    );

    let admin = schema.profiles.find(1);
    let association = admin.associationFor("user");

    expect(association.key).toEqual("user");
    expect(association.modelName).toEqual("user");
    expect(association.ownerModelName).toEqual("profile");

    let frodo = schema.users.find(1);
    let inverse = frodo.inverseFor(association);

    expect(inverse.key).toEqual("profile");
    expect(inverse.modelName).toEqual("profile");
    expect(inverse.ownerModelName).toEqual("user");
  });
});
