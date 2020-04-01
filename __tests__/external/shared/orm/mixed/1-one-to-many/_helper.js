import { Server, Model, hasMany, belongsTo } from "miragejs";

/*
  A model with a hasMany association can be in eight states
  with respect to its association. This helper class
  returns a parent (and its children) in these various states.

  The return value is an array of the form

    [ parent, [child1, child2...] ]

  where the children array may be empty.
*/
export default class Helper {
  constructor() {
    this.server = new Server({
      environment: "test",
      models: {
        user: Model.extend({
          posts: hasMany(),
        }),
        post: Model.extend({
          user: belongsTo(),
        }),
      },
    });

    this.db = this.server.db;
    this.schema = this.server.schema;
  }

  shutdown() {
    this.server.shutdown();
  }

  savedParentNoChildren() {
    let user = this.db.users.insert({ name: "Link" });

    return [this.schema.users.find(user.id), []];
  }

  savedParentNewChildren() {
    let user = this.schema.users.create({ name: "Link" });
    let post1 = this.schema.posts.new({ title: "Lorem" });
    let post2 = this.schema.posts.new({ title: "Ipsum" });

    user.posts = [post1, post2];

    return [user, [post1, post2]];
  }

  savedParentSavedChildren() {
    let { schema } = this;
    schema.db.loadData({
      users: [{ id: "1", name: "Link", postIds: ["1", "2"] }],
      posts: [
        { id: "1", title: "Lorem", userId: "1" },
        { id: "2", title: "Ipsum", userId: "1" },
      ],
    });

    return [schema.users.find(1), [schema.posts.find(1), schema.posts.find(2)]];
  }

  savedParentMixedChildren() {
    this.schema.db.loadData({
      users: [{ id: "1", name: "Link", postIds: ["1"] }],
      posts: [{ id: "1", title: "Lorem", userId: "1" }],
    });
    let user = this.schema.users.find(1);
    let post1 = this.schema.posts.find(1);
    let post2 = this.schema.posts.new({ name: "Ipsum" });

    user.posts = [post1, post2];

    return [user, [post1, post2]];
  }

  newParentNoChildren() {
    let user = this.schema.users.new({ name: "Link" });

    return [user, []];
  }

  newParentNewChildren() {
    let user = this.schema.users.new({ name: "Link" });
    let post1 = this.schema.posts.new({ title: "Lorem" });
    let post2 = this.schema.posts.new({ title: "Ipsum" });

    user.posts = [post1, post2];

    return [user, [post1, post2]];
  }

  newParentSavedChildren() {
    let user = this.schema.users.new({ name: "Link" });
    let post1 = this.schema.posts.create({ title: "Lorem" });
    let post2 = this.schema.posts.create({ title: "Ipsum" });

    user.posts = [post1, post2];

    return [user, [post1, post2]];
  }

  newParentMixedChildren() {
    let user = this.schema.users.new({ name: "Link" });
    let post1 = this.schema.posts.create({ title: "Lorem" });
    let post2 = this.schema.posts.new({ title: "Ipsum" });

    user.posts = [post1, post2];

    return [user, [post1, post2]];
  }

  // Unassociated child models, used for setting tests
  savedChild() {
    let insertedPost = this.db.posts.insert({ title: "Lorem" });

    return this.schema.posts.find(insertedPost.id);
  }

  newChild() {
    return this.schema.posts.new({ title: "Lorem" });
  }
}

export const states = [
  "savedParentNoChildren",
  "savedParentNewChildren",
  "savedParentSavedChildren",
  "savedParentMixedChildren",
  "newParentNoChildren",
  "newParentNewChildren",
  "newParentSavedChildren",
  "newParentMixedChildren",
];
