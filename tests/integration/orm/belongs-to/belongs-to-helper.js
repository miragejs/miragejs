import Mirage from 'ember-cli-mirage';
import Model from 'ember-cli-mirage/orm/model';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';

/*
  A model with a belongsTo association can be in six states
  with respect to its association. This helper class
  returns a child (and its association) in these various states.

  The return value is an array of the form

    [child, parent]

  where the parent may be undefined.
*/
class BelongsToHelper {

  constructor() {
    this.db = new Db();

    this.schema = new Schema(this.db, {
      user: Model.extend(),
      address: Model.extend({
        user: Mirage.belongsTo()
      })
    });
  }

  savedChildNoParent() {
    let insertedAddress = this.db.addresses.insert({ name: 'foo' });

    return [this.schema.addresses.find(insertedAddress.id), undefined];
  }

  savedChildNewParent() {
    let insertedAddress = this.db.addresses.insert({ name: 'foo' });
    let address = this.schema.addresses.find(insertedAddress.id);
    let user = this.schema.users.new({ name: 'Newbie' });

    address.user = user;

    return [address, user];
  }

  savedChildSavedParent() {
    let insertedUser = this.db.users.insert({ name: 'some user' });
    let insertedAddress = this.db.addresses.insert({ name: 'foo', userId: insertedUser.id });
    let address = this.schema.addresses.find(insertedAddress.id);
    let user = this.schema.users.find(insertedUser.id);

    return [address, user];
  }

  newChildNoParent() {
    return [this.schema.addresses.new({ name: 'New addr' }), undefined];
  }

  newChildNewParent() {
    let address = this.schema.addresses.new({ name: 'New addr' });
    let newUser = this.schema.users.new({ name: 'Newbie' });
    address.user = newUser;

    return [address, newUser];
  }

  newChildSavedParent() {
    let insertedUser = this.db.users.insert({ name: 'some user' });
    let address = this.schema.addresses.new({ name: 'New addr' });
    let savedUser = this.schema.users.find(insertedUser.id);

    address.user = savedUser;

    return [address, savedUser];
  }

  // Just a saved unassociated parent. The id is high so as not to
  // interfere with any other parents
  savedParent() {
    let insertedUser = this.db.users.insert({ name: 'bar' });

    return this.schema.users.find(insertedUser.id);
  }

  newParent() {
    return this.schema.users.new({ name: 'Newbie' });
  }

}

export default BelongsToHelper;
