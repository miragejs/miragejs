import "@lib/container";
import { Model, Schema, hasMany } from "@lib";

describe("Integration | ORM | Schema Verification | Has Many", function () {
  test("a one-way has many association is correct", () => {
    let schema = new Schema({
      initialData: {
        users: [{ id: 1, name: "Frodo" }],
        posts: [{ id: 1, title: "Lorem" }],
      },
      models: {
        user: Model.extend({
          posts: hasMany(),
        }),
        post: Model.extend(),
      },
    });

    let frodo = schema.users.find(1);
    let association = frodo.associationFor("posts");

    expect(association.name).toBe("posts");
    expect(association.modelName).toBe("post");
    expect(association.ownerModelName).toBe("user");

    let post = schema.posts.find(1);

    expect(post.inverseFor(association) === null).toBeTruthy();
  });

  test("a named one-way has many association is correct", () => {
    let schema = new Schema({
      initialData: {
        users: [{ id: 1, name: "Frodo" }],
        posts: [{ id: 1, title: "Lorem" }],
      },
      models: {
        user: Model.extend({
          blogPosts: hasMany("post"),
        }),
        post: Model.extend(),
      },
    });

    let frodo = schema.users.find(1);
    let association = frodo.associationFor("blogPosts");

    expect(association.name).toBe("blogPosts");
    expect(association.modelName).toBe("post");
    expect(association.ownerModelName).toBe("user");

    let post = schema.posts.find(1);

    expect(post.inverseFor(association) === null).toBeTruthy();
  });

  test("a reflexive hasMany association with an implicit inverse is correct", () => {
    let schema = new Schema({
      initialData: {
        tags: [{ id: 1, name: "economics" }],
      },
      models: {
        tag: Model.extend({
          tags: hasMany(),
        }),
      },
    });

    let tag = schema.tags.find(1);
    let association = tag.associationFor("tags");

    expect(association.name).toBe("tags");
    expect(association.modelName).toBe("tag");
    expect(association.ownerModelName).toBe("tag");

    expect(tag.inverseFor(association) === association).toBeTruthy();
  });
});
