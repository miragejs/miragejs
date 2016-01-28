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
      homeAddresses: []
    });

    this.schema = new Schema(this.db, {
      user: Model.extend({
        homeAddresses: Mirage.hasMany()
      }),
      homeAddress: Model
    });
  }

  savedParentNoChildren() {
    let insertedUser = this.db.users.insert({name: 'Link'});

    return [this.schema.user.find(insertedUser.id), []];
  }

  savedParentNewChildren() {
    let insertedUser = this.db.users.insert({name: 'Link'});

    var user = this.schema.user.find(insertedUser.id);
    var newHomeAddress = user.newHomeAddress();

    return [user, [newHomeAddress]];
  }

  savedParentSavedChildren() {
    let insertedUser = this.db.users.insert({name: 'Link'});
    let insertedHomeAddress = this.db.homeAddresses.insert({name: '123 Hyrule Way', userId: insertedUser.id});

    var user = this.schema.user.find(insertedUser.id);
    var homeAddress = this.schema.homeAddress.find(insertedHomeAddress.id);

    return [user, [homeAddress]];
  }

  savedParentMixedChildren() {
    let insertedUser = this.db.users.insert({name: 'Link'});
    let insertedHomeAddress = this.db.homeAddresses.insert({name: '123 Hyrule Way', userId: insertedUser.id});

    var user = this.schema.user.find(insertedUser.id);
    var savedHomeAddress = this.schema.homeAddress.find(insertedHomeAddress.id);
    var newHomeAddress = user.newHomeAddress();

    return [user, [savedHomeAddress, newHomeAddress]];
  }

  newParentNoChildren() {
    var user = this.schema.user.new();

    return [user, []];
  }

  newParentNewChildren() {
    var user = this.schema.user.new();
    var newHomeAddress = user.newHomeAddress();

    return [user, [newHomeAddress]];
  }

  newParentSavedChildren() {
    let insertedHomeAddress = this.db.homeAddresses.insert({name: '123 Hyrule Way'});
    let savedHomeAddress = this.schema.homeAddress.find(insertedHomeAddress.id);
    let newUser = this.schema.user.new({homeAddresses: [savedHomeAddress]});

    return [newUser, [savedHomeAddress]];
  }

  newParentMixedChildren() {
    let insertedHomeAddress = this.db.homeAddresses.insert({name: '123 Hyrule Way'});
    var savedHomeAddress = this.schema.homeAddress.find(insertedHomeAddress.id);
    var newHomeAddress = this.schema.homeAddress.new();

    var newUser = this.schema.user.new({homeAddresses: [savedHomeAddress, newHomeAddress]});

    return [newUser, [savedHomeAddress, newHomeAddress]];
  }

  // Just a saved unassociated child. The id is high so as not to
  // interfere with any other children
  savedChild() {
    let insertedHomeAddress = this.db.homeAddresses.insert({name: 'foo'});

    return this.schema.homeAddress.find(insertedHomeAddress.id);
  }

  newChild() {
    return this.schema.homeAddress.new({name: 'Newbie'});
  }


}

export default HasManyHelper;
