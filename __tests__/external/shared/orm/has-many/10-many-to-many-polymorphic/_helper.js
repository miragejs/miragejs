import { Server, Model, hasMany } from "miragejs";

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
        post: Model.extend({
          users: hasMany(),
        }),
        user: Model.extend({
          commentables: hasMany({ polymorphic: true }),
        }),
      },
    });

    this.db = this.server.db;
    this.loadData = this.db.loadData.bind(this.db);
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

    user.commentables = [post1, post2];

    return [user, [post1, post2]];
  }

  savedParentSavedChildren() {
    this.loadData({
      posts: [
        { id: "1", title: "Lorem", userIds: ["1"] },
        { id: "2", title: "Ipsum", userIds: ["1"] },
      ],
      users: [
        {
          id: "1",
          name: "Link",
          commentableIds: [
            { type: "post", id: "1" },
            { type: "post", id: "2" },
          ],
        },
      ],
    });

    let user = this.schema.users.find(1);
    let post1 = this.schema.posts.find(1);
    let post2 = this.schema.posts.find(2);

    return [user, [post1, post2]];
  }

  savedParentMixedChildren() {
    this.loadData({
      posts: [{ id: "1", title: "Lorem", userIds: [] }],
      users: [{ id: "1", name: "Link", commentableIds: [] }],
    });

    let user = this.schema.users.find(1);
    let post1 = this.schema.posts.find(1);
    let post2 = this.schema.posts.new({ title: "Ipsum" });

    user.commentables = [post1, post2];

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

    user.commentables = [post1, post2];

    return [user, [post1, post2]];
  }

  newParentSavedChildren() {
    let user = this.schema.users.new({ name: "Link" });
    let post1 = this.schema.posts.create({ title: "Lorem" });
    let post2 = this.schema.posts.create({ title: "Ipsum" });

    user.commentables = [post1, post2];

    return [user, [post1, post2]];
  }

  newParentMixedChildren() {
    let user = this.schema.users.new({ name: "Link" });
    let post1 = this.schema.posts.create({ title: "Lorem" });
    let post2 = this.schema.posts.new({ title: "Ipsum" });

    user.commentables = [post1, post2];

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
