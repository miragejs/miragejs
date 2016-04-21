import BelongsToHelper from './belongs-to-helper';
import Mirage from 'ember-cli-mirage';
import Model from 'ember-cli-mirage/orm/model';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import {module, test} from 'qunit';

module('Integration | ORM | belongsTo #accessor', {
  beforeEach() {
    this.helper = new BelongsToHelper();
  }
});

/*
  #association behavior works regardless of the state of the child
*/

[
  'savedChildNoParent',
  'savedChildNewParent',
  'savedChildSavedParent',
  'newChildNoParent',
  'newChildNewParent',
  'newChildSavedParent'
].forEach((state) => {

  test(`the references of a ${state} are correct`, function(assert) {
    let [address, user] = this.helper[state]();

    assert.deepEqual(address.user, user ? user : null, 'the model reference is correct');
    assert.equal(address.userId, user ? user.id : null, 'the modelId reference is correct');
  });

});

test('belongsTo accessors works when foreign key is present but falsy', function(assert) {
  let db = new Db({
    users: [],
    addresses: []
  });

  let schema = new Schema(db, {
    user: Model.extend(),
    address: Model.extend({
      user: Mirage.belongsTo()
    })
  });

  db.users.insert({ id: 0, name: 'some user' });
  let insertedAddress = db.addresses.insert({ name: 'foo', userId: 0 });
  let relatedUser = schema.addresses.find(insertedAddress.id).user;
  assert.equal('some user', relatedUser ? relatedUser.name : undefined);
});
