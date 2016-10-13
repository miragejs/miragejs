import { Model, belongsTo } from 'ember-cli-mirage';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';

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
    this.db = new Db();

    this.schema = new Schema(this.db, {
      user: Model.extend({
        bestFriend: belongsTo('user') // implicit inverse
      })
    });
  }

  savedChildNoParent() {
    let insertedUser = this.db.users.insert({ name: 'Link' });

    return [ this.schema.users.find(insertedUser.id), undefined ];
  }

  savedChildNewParent() {
    let user = this.schema.users.create({ name: 'Link' });
    let friend = this.schema.users.new({ name: 'Bob' });

    user.bestFriend = friend;

    return [ user, friend ];
  }

  savedChildSavedParent() {
    let insertedFriend = this.db.users.insert({ name: 'Bob' });
    let insertedUser = this.db.users.insert({ name: 'Link', bestFriendId: insertedFriend.id });
    this.db.users.update(insertedFriend.id, { bestFriendId: insertedUser.id });
    let user = this.schema.users.find(insertedUser.id);
    let friend = this.schema.users.find(insertedFriend.id);

    return [ user, friend ];
  }

  newChildNoParent() {
    return [ this.schema.users.new({ name: 'Link' }), undefined ];
  }

  newChildNewParent() {
    let friend = this.schema.users.new({ name: 'Link' });
    let user = this.schema.users.new({ name: 'Bob' });
    user.bestFriend = friend;

    return [ user, friend ];
  }

  newChildSavedParent() {
    let insertedFriend = this.db.users.insert({ name: 'Bob' });
    let user = this.schema.users.new({ name: 'Link' });
    let savedFriend = this.schema.users.find(insertedFriend.id);

    user.bestFriend = savedFriend;

    return [ user, savedFriend ];
  }

  // Just a saved unassociated parent.
  savedParent() {
    let insertedParent = this.db.users.insert({ name: 'Bob' });

    return this.schema.users.find(insertedParent.id);
  }

  newParent() {
    return this.schema.users.new({ name: 'Bob' });
  }

}

export const states = [
  'savedChildNoParent',
  'savedChildNewParent',
  'savedChildSavedParent',
  'newChildNoParent',
  'newChildNewParent',
  'newChildSavedParent'
];
