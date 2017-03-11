import Helper from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One To One | instantiating', {
  beforeEach() {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  }
});

test('the child accepts a saved parent id', function(assert) {
  let profile = this.helper.savedParent();
  let user = this.schema.users.new({ profileId: profile.id });

  assert.equal(user.profileId, profile.id);
  assert.deepEqual(user.profile.attrs, profile.attrs);
  assert.deepEqual(user.attrs, { profileId: profile.id });
});

test('the child errors if the parent id doesnt exist', function(assert) {
  assert.throws(function() {
    this.schema.users.new({ profileId: 2 });
  }, /You're instantiating a user that has a profileId of 2, but that record doesn't exist in the database/);
});

test('the child accepts a null parent id', function(assert) {
  let user = this.schema.users.new({ profileId: null });

  assert.equal(user.profileId, null);
  assert.equal(user.profile, null);
  assert.deepEqual(user.attrs, { profileId: null });
});

test('the child accepts a saved parent model', function(assert) {
  let profile = this.helper.savedParent();
  let user = this.schema.users.new({ profile });

  assert.equal(user.profileId, 1);
  assert.deepEqual(user.profile.attrs, profile.attrs);
  assert.deepEqual(user.attrs, { profileId: null }); // this would update when saved
});

test('the child accepts a new parent model', function(assert) {
  let profile = this.schema.profiles.new({ age: 300 });
  let user = this.schema.users.new({ profile });

  assert.equal(user.profileId, null);
  assert.deepEqual(user.profile, profile);
  assert.deepEqual(user.attrs, { profileId: null });
});

test('the child accepts a null parent model', function(assert) {
  let user = this.schema.users.new({ profile: null });

  assert.equal(user.profileId, null);
  assert.deepEqual(user.profile, null);
  assert.deepEqual(user.attrs, { profileId: null });
});

test('the child accepts a parent model and id', function(assert) {
  let profile = this.helper.savedParent();
  let user = this.schema.users.new({ profile, profileId: profile.id });

  assert.equal(user.profileId, '1');
  assert.deepEqual(user.profile, profile);
  assert.deepEqual(user.attrs, { profileId: profile.id });
});

test('the child accepts no reference to a parent id or model as empty obj', function(assert) {
  let user = this.schema.users.new({});

  assert.equal(user.profileId, null);
  assert.deepEqual(user.profile, null);
  assert.deepEqual(user.attrs, { profileId: null });
});

test('the child accepts no reference to a parent id or model', function(assert) {
  let user = this.schema.users.new();

  assert.equal(user.profileId, null);
  assert.deepEqual(user.profile, null);
  assert.deepEqual(user.attrs, { profileId: null });
});
