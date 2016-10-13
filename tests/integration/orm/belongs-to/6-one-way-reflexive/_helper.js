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
        user: belongsTo('user', { inverse: null })
      })
    });
  }

  savedChildNoParent() {
    let insertedUser = this.db.users.insert({ name: 'Link' });

    return [ this.schema.users.find(insertedUser.id), undefined ];
  }

  savedChildNewParent() {
    let child = this.schema.users.create({ name: 'Link' });
    let parent = this.schema.users.new({ name: 'Bob' });

    child.user = parent;

    return [ child, parent ];
  }

  savedChildSavedParent() {
    let insertedParent = this.db.users.insert({ name: 'Bob' });
    let insertedChild = this.db.users.insert({ name: 'Link', userId: insertedParent.id });
    let child = this.schema.users.find(insertedChild.id);
    let parent = this.schema.users.find(insertedParent.id);

    return [ child, parent ];
  }

  newChildNoParent() {
    return [ this.schema.users.new({ name: 'Link' }), undefined ];
  }

  newChildNewParent() {
    let parent = this.schema.users.new({ name: 'Link' });
    let child = this.schema.users.new({ name: 'Bob' });
    child.user = parent;

    return [ child, parent ];
  }

  newChildSavedParent() {
    let insertedParent = this.db.users.insert({ name: 'Bob' });
    let child = this.schema.users.new({ name: 'Link' });
    let savedParent = this.schema.users.find(insertedParent.id);

    child.user = savedParent;

    return [ child, savedParent ];
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
