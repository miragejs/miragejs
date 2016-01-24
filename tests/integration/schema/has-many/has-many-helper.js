import Mirage from 'ember-cli-mirage';
import Model from 'ember-cli-mirage/orm/model';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';

/*
  A model with a hasMany association can be in eight states
  with respect to its association. This helper class
  returns a parent (and its children) in these various states.

  The return value is an array of the form

    [parent, [child1, child2...]]

  where the children array may be undefined.
*/
class HasManyHelper {

  constructor() {
    this.db = new Db({
      users: [],
      addresses: []
    });

    this.schema = new Schema(this.db, {
      user: Model.extend({
        addresses: Mirage.hasMany()
      }),
      address: Model
    });
  }

  savedParentNoChildren() {
    let insertedUser = this.db.users.insert({name: 'Link'});

    return [this.schema.user.find(insertedUser.id), []];
  }

  savedParentNewChildren() {
    let insertedUser = this.db.users.insert({name: 'Link'});

    var user = this.schema.user.find(insertedUser.id);
    var newAddress = user.newAddress();

    return [user, [newAddress]];
  }

  savedParentSavedChildren() {
    let insertedUser = this.db.users.insert({name: 'Link'});
    let insertedAddress = this.db.addresses.insert({name: '123 Hyrule Way', userId: insertedUser.id});

    var user = this.schema.user.find(insertedUser.id);
    var address = this.schema.address.find(insertedAddress.id);

    return [user, [address]];
  }

  savedParentMixedChildren() {
    let insertedUser = this.db.users.insert({name: 'Link'});
    let insertedAddress = this.db.addresses.insert({name: '123 Hyrule Way', userId: insertedUser.id});

    var user = this.schema.user.find(insertedUser.id);
    var savedAddress = this.schema.address.find(insertedAddress.id);
    var newAddress = user.newAddress();

    return [user, [savedAddress, newAddress]];
  }

  newParentNoChildren() {
    var user = this.schema.user.new();

    return [user, []];
  }

  newParentNewChildren() {
    var user = this.schema.user.new();
    var newAddress = user.newAddress();

    return [user, [newAddress]];
  }

  newParentSavedChildren() {
    let insertedAddress = this.db.addresses.insert({name: '123 Hyrule Way'});
    let savedAddress = this.schema.address.find(insertedAddress.id);
    let newUser = this.schema.user.new({addresses: [savedAddress]});

    return [newUser, [savedAddress]];
  }

  newParentMixedChildren() {
    let insertedAddress = this.db.addresses.insert({name: '123 Hyrule Way'});
    var savedAddress = this.schema.address.find(insertedAddress.id);
    var newAddress = this.schema.address.new();

    var newUser = this.schema.user.new({addresses: [savedAddress, newAddress]});

    return [newUser, [savedAddress, newAddress]];
  }

  // Just a saved unassociated child. The id is high so as not to
  // interfere with any other children
  savedChild() {
    let insertedAddress = this.db.addresses.insert({name: 'foo'});

    return this.schema.address.find(insertedAddress.id);
  }

  newChild() {
    return this.schema.address.new({name: 'Newbie'});
  }


}

export default HasManyHelper;
