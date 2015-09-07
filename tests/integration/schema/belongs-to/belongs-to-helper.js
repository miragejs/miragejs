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
    this.db = new Db({
      users: [],
      addresses: []
    });
    this.schema = new Schema(this.db);

    var User = Model;
    var Address = Model.extend({
      user: Mirage.belongsTo()
    });

    this.schema.registerModels({
      user: User,
      address: Address
    });
  }

  savedChildNoParent() {
    this.db.addresses.insert({id: 1, name: 'foo'});

    return [this.schema.address.find(1), undefined];
  }

  savedChildNewParent() {
    this.db.addresses.insert({id: 1, name: 'foo'});

    var address = this.schema.address.find(1);
    var user = this.schema.user.new({name: 'Newbie'});
    address.user = user;

    return [address, user];
  }

  savedChildSavedParent() {
    this.db.users.insert({id: 1, name: 'some user'});
    this.db.addresses.insert({id: 1, name: 'foo', userId: 1});

    var address = this.schema.address.find(1);
    var user = this.schema.user.find(1);

    return [address, user];
  }

  newChildNoParent() {
    return [this.schema.address.new({name: 'New addr'}), undefined];
  }

  newChildNewParent() {
    var address = this.schema.address.new({name: 'New addr'});
    var newUser = this.schema.user.new({name: 'Newbie'});
    address.user = newUser;

    return [address, newUser];
  }

  newChildSavedParent() {
    this.db.users.insert({id: 1, name: 'some user'});

    var address = this.schema.address.new({name: 'New addr'});
    var savedUser = this.schema.user.find(1);
    address.user = savedUser;

    return [address, savedUser];
  }

  // Just a saved unassociated parent. The id is high so as not to
  // interfere with any other parents
  savedParent() {
    this.db.users.insert({id: 100, name: 'bar'});

    return this.schema.user.find(100);
  }

  newParent() {
    return this.schema.user.new({name: 'Newbie'});
  }

}

export default BelongsToHelper;
