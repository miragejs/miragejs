import "@lib/container";
import { Model, Schema, belongsTo } from "@lib";

describe("Internal | Integration | Schema | Schema Verification | Belongs To", function () {
  test("a one-way belongsTo association is correct", () => {
    let schema = new Schema({
      initialData: {
        authors: [{ id: 1, name: "Frodo" }],
        posts: [{ id: 1, title: "Lorem ipsum" }],
      },
      models: {
        author: Model.extend(),
        post: Model.extend({
          author: belongsTo(),
        }),
      },
    });

    let post = schema.posts.find(1);
    let association = post.associationFor("author");
    let frodo = schema.authors.find(1);

    expect(association.name).toBe("author");
    expect(association.modelName).toBe("author");
    expect(association.ownerModelName).toBe("post");
    expect(frodo.inverseFor(association) === null).toBeTruthy();
  });

  test("a one-way named belongsTo association is correct", () => {
    let schema = new Schema({
      initialData: {
        users: [{ id: 1, name: "Frodo" }],
        posts: [{ id: 1, title: "Lorem ipsum" }],
      },
      models: {
        user: Model.extend(),
        post: Model.extend({
          author: belongsTo("user"),
        }),
      },
    });

    let post = schema.posts.find(1);
    let association = post.associationFor("author");
    let frodo = schema.users.find(1);

    expect(association.name).toBe("author");
    expect(association.modelName).toBe("user");
    expect(association.ownerModelName).toBe("post");
    expect(frodo.inverseFor(association) === null).toBeTruthy();
  });

  test("a reflexive belongsTo association is correct and has an implicit inverse", () => {
    let schema = new Schema({
      initialData: {
        users: [{ id: 1, name: "Frodo" }],
      },
      models: {
        user: Model.extend({
          user: belongsTo(),
        }),
      },
    });

    let frodo = schema.users.find(1);
    let association = frodo.associationFor("user");

    expect(association.name).toBe("user");
    expect(association.modelName).toBe("user");
    expect(association.ownerModelName).toBe("user");
    expect(frodo.inverseFor(association) === association).toBeTruthy();
  });

  test("a named reflexive belongsTo association with an implicit inverse is correct", () => {
    let schema = new Schema({
      initialData: {
        users: [{ id: 1, name: "Frodo" }],
      },
      models: {
        user: Model.extend({
          bestFriend: belongsTo("user"),
        }),
      },
    });

    let frodo = schema.users.find(1);
    let association = frodo.associationFor("bestFriend");

    expect(association.name).toBe("bestFriend");
    expect(association.modelName).toBe("user");
    expect(association.ownerModelName).toBe("user");
    expect(frodo.inverseFor(association) === association).toBeTruthy();
  });

  test("a named reflexive belongsTo association with an explicit inverse is correct", () => {
    let schema = new Schema({
      initialData: {
        users: [{ id: 1, name: "Frodo" }],
      },
      models: {
        user: Model.extend({
          bestFriend: belongsTo("user", { inverse: "bestFriend" }),
        }),
      },
    });

    let frodo = schema.users.find(1);
    let association = frodo.associationFor("bestFriend");

    expect(association.name).toBe("bestFriend");
    expect(association.modelName).toBe("user");
    expect(association.ownerModelName).toBe("user");
    expect(frodo.inverseFor(association) === association).toBeTruthy();
  });

  test("a one-way reflexive belongsTo association with a null inverse is correct", () => {
    let schema = new Schema({
      initialData: {
        users: [{ id: 1, name: "Frodo" }],
      },
      models: {
        user: Model.extend({
          user: belongsTo("user", { inverse: null }),
        }),
      },
    });

    let frodo = schema.users.find(1);
    let association = frodo.associationFor("user");

    expect(association.name).toBe("user");
    expect(association.modelName).toBe("user");
    expect(association.ownerModelName).toBe("user");
    expect(frodo.inverseFor(association) === null).toBeTruthy();
  });

  test("a named one-way way reflexive belongsTo association with a null inverse is correct", () => {
    let schema = new Schema({
      initialData: {
        users: [{ id: 1, name: "Frodo" }],
      },
      models: {
        user: Model.extend({
          parent: belongsTo("user", { inverse: null }),
        }),
      },
    });

    let frodo = schema.users.find(1);
    let association = frodo.associationFor("parent");

    expect(association.name).toBe("parent");
    expect(association.modelName).toBe("user");
    expect(association.ownerModelName).toBe("user");
    expect(frodo.inverseFor(association) === null).toBeTruthy();
  });

  test("a one-to-one belongsTo association with an implicit inverse is correct", () => {
    let schema = new Schema({
      initialData: {
        users: [{ id: 1, name: "Frodo" }],
        profiles: [{ id: 1, type: "Admin" }],
      },
      models: {
        user: Model.extend({
          profile: belongsTo(),
        }),
        profile: Model.extend({
          user: belongsTo(),
        }),
      },
    });

    let admin = schema.profiles.find(1);
    let association = admin.associationFor("user");

    expect(association.name).toBe("user");
    expect(association.modelName).toBe("user");
    expect(association.ownerModelName).toBe("profile");

    let frodo = schema.users.find(1);
    let inverse = frodo.inverseFor(association);

    expect(inverse.name).toBe("profile");
    expect(inverse.modelName).toBe("profile");
    expect(inverse.ownerModelName).toBe("user");
  });
});
