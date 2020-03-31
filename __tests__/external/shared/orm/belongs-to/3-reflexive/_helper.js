import { Server, Model, belongsTo } from "miragejs";

/*
  A model with a belongsTo association can be in six states
  with respect to its association. This helper class
  returns a child (and its association) in these various states.

  The return value is an array of the form

    [ child, parent ]

  where the parent may be undefined.
*/
export default class BelongsToHelper {
  constructor() {
    this.server = new Server({
      environment: "test",
      models: {
        user: Model.extend({
          user: belongsTo(), // implicit inverse
        }),
      },
    });

    this.db = this.server.db;
    this.schema = this.server.schema;
  }

  shutdown() {
    this.server.shutdown();
  }

  savedChildNoParent() {
    let insertedUser = this.db.users.insert({ name: "Link" });

    return [this.schema.users.find(insertedUser.id), undefined];
  }

  savedChildNewParent() {
    let user = this.schema.users.create({ name: "Link" });
    let friend = this.schema.users.new({ name: "Bob" });

    user.user = friend;

    return [user, friend];
  }

  savedChildSavedParent() {
    let insertedFriend = this.db.users.insert({ name: "Bob" });
    let insertedUser = this.db.users.insert({
      name: "Link",
      userId: insertedFriend.id,
    });
    this.db.users.update(insertedFriend.id, { userId: insertedUser.id });
    let user = this.schema.users.find(insertedUser.id);
    let friend = this.schema.users.find(insertedFriend.id);

    return [user, friend];
  }

  newChildNoParent() {
    return [this.schema.users.new({ name: "Link" }), undefined];
  }

  newChildNewParent() {
    let friend = this.schema.users.new({ name: "Link" });
    let user = this.schema.users.new({ name: "Bob" });
    user.user = friend;

    return [user, friend];
  }

  newChildSavedParent() {
    let insertedFriend = this.db.users.insert({ name: "Bob" });
    let user = this.schema.users.new({ name: "Link" });
    let savedFriend = this.schema.users.find(insertedFriend.id);

    user.user = savedFriend;

    return [user, savedFriend];
  }

  // Just a saved unassociated parent.
  savedParent() {
    let insertedParent = this.db.users.insert({ name: "Bob" });

    return this.schema.users.find(insertedParent.id);
  }

  newParent() {
    return this.schema.users.new({ name: "Bob" });
  }
}

export const states = [
  "savedChildNoParent",
  "savedChildNewParent",
  "savedChildSavedParent",
  "newChildNoParent",
  "newChildNewParent",
  "newChildSavedParent",
];
