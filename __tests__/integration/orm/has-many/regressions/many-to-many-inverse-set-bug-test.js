import {
  Model,
  hasMany,
  _Db as Db,
  _ormSchema as Schema
} from "@miragejs/server";

describe("Integration | ORM | Has Many | Regressions | Many to many inverse set bug", () => {
  beforeEach(() => {
    this.db = new Db();

    this.schema = new Schema(this.db, {
      post: Model.extend({
        tags: hasMany()
      }),
      tag: Model.extend({
        posts: hasMany()
      })
    });
  });

  test(`it works`, () => {
    this.db.loadData({
      posts: [{ id: "1", tagIds: ["15", "16"] }, { id: "2", tagIds: ["16"] }],
      tags: [{ id: "15", postIds: ["1"] }, { id: "16", postIds: ["1", "2"] }]
    });

    this.schema.posts.find(1).update({ tagIds: ["15"] });

    expect(this.db.posts.find(1).tagIds).toEqual(["15"]);
    expect(this.db.tags.find(15).postIds).toEqual(["1"]);
    expect(this.db.tags.find(16).postIds).toEqual(["2"]);
  });
});
