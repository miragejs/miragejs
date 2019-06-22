import { Model, hasMany, belongsTo } from "ember-cli-mirage";
import Schema from "ember-cli-mirage/orm/schema";
import Db from "ember-cli-mirage/db";

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
    this.db = new Db();

    this.schema = new Schema(this.db, {
      user: Model.extend({
        posts: hasMany()
      }),
      post: Model.extend({
        user: belongsTo()
      })
    });
  }

  savedChildNoParent() {
    let post = this.db.posts.insert({ title: "Lorem" });

    return [this.schema.posts.find(post.id), null];
  }

  savedChildNewParent() {
    let post = this.schema.posts.create({ title: "Lorem" });
    let user = this.schema.users.new({ name: "Link" });

    post.user = user;

    return [post, user];
  }

  savedChildSavedParent() {
    let { schema } = this;
    schema.db.loadData({
      posts: [{ id: "1", title: "Lorem", userId: "1" }],
      users: [{ id: "1", name: "Link", postIds: ["1"] }]
    });

    return [schema.posts.find(1), schema.users.find(1)];
  }

  newChildNoParent() {
    let post = this.schema.posts.new({ title: "Lorem" });

    return [post, null];
  }

  newChildNewParent() {
    let post = this.schema.posts.new({ title: "Lorem" });
    let user = this.schema.users.new({ name: "Link" });

    post.user = user;

    return [post, user];
  }

  newChildSavedParent() {
    let post = this.schema.posts.create({ title: "Lorem" });
    let user = this.schema.users.new({ name: "Link" });

    post.user = user;

    return [post, user];
  }

  // Unassociated models
  savedParent() {
    let insertedUser = this.db.users.insert({ name: "Link" });

    return this.schema.users.find(insertedUser.id);
  }

  newParent() {
    return this.schema.users.new({ name: "Link" });
  }
}

export const states = [
  "savedChildNoParent",
  "savedChildNewParent",
  "savedChildSavedParent",
  "newChildNoParent",
  "newChildNewParent",
  "newChildSavedParent"
];
