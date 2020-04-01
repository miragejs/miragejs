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
          profile: belongsTo(),
        }),
        profile: Model.extend({
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

  savedChildNoParent() {
    let insertedUser = this.db.users.insert({ name: "Link" });

    return [this.schema.users.find(insertedUser.id), undefined];
  }

  savedChildNewParent() {
    let user = this.schema.users.create({ name: "Link" });
    let profile = this.schema.profiles.new({ age: 300 });

    user.profile = profile;

    return [user, profile];
  }

  savedChildSavedParent() {
    let insertedProfile = this.db.profiles.insert({ age: 300 });
    let insertedUser = this.db.users.insert({
      name: "Link",
      profileId: insertedProfile.id,
    });
    this.db.profiles.update(insertedProfile.id, { userId: insertedUser.id });
    let user = this.schema.users.find(insertedUser.id);
    let profile = this.schema.profiles.find(insertedProfile.id);

    return [user, profile];
  }

  newChildNoParent() {
    return [this.schema.users.new({ name: "Link" }), undefined];
  }

  newChildNewParent() {
    let profile = this.schema.profiles.new({ age: 300 });
    let user = this.schema.users.new({ name: "Link" });
    user.profile = profile;

    return [user, profile];
  }

  newChildSavedParent() {
    let insertedProfile = this.db.profiles.insert({ age: 300 });
    let user = this.schema.users.new({ name: "Link" });
    let savedProfile = this.schema.profiles.find(insertedProfile.id);

    user.profile = savedProfile;

    return [user, savedProfile];
  }

  // Just a saved unassociated parent.
  savedParent() {
    let insertedProfile = this.db.profiles.insert({ age: 300 });

    return this.schema.profiles.find(insertedProfile.id);
  }

  newParent() {
    return this.schema.profiles.new({ age: 300 });
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
