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
          representative: belongsTo("user", { inverse: null }),
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
    let link = this.db.users.insert({ name: "Link" });

    return [this.schema.users.find(link.id), undefined];
  }

  savedChildSavedParent() {
    let linkDbRecord = this.db.users.insert({ name: "Link" });
    this.db.users.update(linkDbRecord.id, {
      representativeId: linkDbRecord.id,
    });

    let link = this.schema.users.find(linkDbRecord.id);

    return [link, link];
  }

  newChildNoParent() {
    return [this.schema.users.new({ name: "Link" }), undefined];
  }

  newChildNewParent() {
    let link = this.schema.users.new({ name: "Link" });
    link.representative = link;

    return [link, link];
  }

  // Just a saved unassociated parent.
  // savedParent() {
  //   let insertedParent = this.db.users.insert({ name: 'Bob' });
  //
  //   return this.schema.users.find(insertedParent.id);
  // }
  //
  // newParent() {
  //   return this.schema.users.new({ name: 'Bob' });
  // }
}

export const states = [
  "savedChildNoParent",
  "savedChildSavedParent",
  "newChildNoParent",
  "newChildNewParent",
];
