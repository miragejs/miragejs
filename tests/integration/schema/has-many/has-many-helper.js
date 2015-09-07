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
    this.schema = new Schema(this.db);

    var User = Model.extend({
      addresses: Mirage.hasMany()
    });
    var Address = Model;

    this.schema.registerModels({
      user: User,
      address: Address
    });
  }

  savedParentNoChildren() {
    this.db.users.insert({id: 1, name: 'Link'});

    return [this.schema.user.find(1), []];
  }

  savedParentNewChildren() {
    this.db.users.insert({id: 1, name: 'Link'});

    var user = this.schema.user.find(1);
    var newAddress = user.newAddress();

    return [user, [newAddress]];
  }

  savedParentSavedChildren() {
    this.db.users.insert({id: 1, name: 'Link'});
    this.db.addresses.insert({id: 1, name: '123 Hyrule Way', userId: 1});

    var user = this.schema.user.find(1);
    var address = this.schema.address.find(1);

    return [user, [address]];
  }

  savedParentMixedChildren() {
    this.db.users.insert({id: 1, name: 'Link'});
    this.db.addresses.insert({id: 1, name: '123 Hyrule Way', userId: 1});

    var user = this.schema.user.find(1);
    var savedAddress = this.schema.address.find(1);
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
    this.db.addresses.insert({id: 1, name: '123 Hyrule Way'});
    var savedAddress = this.schema.address.find(1);
    var newUser = this.schema.user.new({addresses: [savedAddress]});

    return [newUser, [savedAddress]];
  }

  newParentMixedChildren() {
    this.db.addresses.insert({id: 1, name: '123 Hyrule Way'});
    var savedAddress = this.schema.address.find(1);
    var newAddress = this.schema.address.new();

    var newUser = this.schema.user.new({addresses: [savedAddress, newAddress]});

    return [newUser, [savedAddress, newAddress]];
  }

  // Just a saved unassociated child. The id is high so as not to
  // interfere with any other children
  savedChild() {
    this.db.addresses.insert({id: 100, name: 'foo'});

    return this.schema.address.find(100);
  }

  newChild() {
    return this.schema.address.new({name: 'Newbie'});
  }


}

export default HasManyHelper;
