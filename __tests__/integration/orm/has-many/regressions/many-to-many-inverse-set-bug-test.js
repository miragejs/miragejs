import "@lib/container";
import Db from "@lib/db";
import Schema from "@lib/orm/schema";
import { Model, hasMany } from "@miragejs/server";

describe("Integration | ORM | Has Many | Regressions | Many to many inverse set bug", () => {
  let db, schema;

  beforeEach(() => {
    db = new Db();

    schema = new Schema(db, {
      post: Model.extend({
        tags: hasMany()
      }),
      tag: Model.extend({
        posts: hasMany()
      })
    });
  });

  test(`it works`, () => {
    db.loadData({
      posts: [{ id: "1", tagIds: ["15", "16"] }, { id: "2", tagIds: ["16"] }],
      tags: [{ id: "15", postIds: ["1"] }, { id: "16", postIds: ["1", "2"] }]
    });

    schema.posts.find(1).update({ tagIds: ["15"] });

    expect(db.posts.find(1).tagIds).toEqual(["15"]);
    expect(db.tags.find(15).postIds).toEqual(["1"]);
    expect(db.tags.find(16).postIds).toEqual(["2"]);
  });
});
