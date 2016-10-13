import Helper from './_helper';
import { Model } from 'ember-cli-mirage';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One To One | create', {
  beforeEach() {
    this.helper = new Helper();
    this.helper.schema.registerModel('foo', Model);
  }
});

test('it sets up associations correctly when passing in the foreign key', function(assert) {
  let { schema } = this.helper;
  let profile = schema.create('profile');
  let user = schema.create('user', {
    profileId: profile.id
  });
  profile.reload();

  assert.equal(user.profileId, profile.id);
  assert.deepEqual(user.profile.attrs, profile.attrs);
  assert.deepEqual(profile.user.attrs, user.attrs);
  assert.equal(schema.db.users.length, 1);
  assert.equal(schema.db.profiles.length, 1);
  assert.deepEqual(schema.db.users[0], { id: '1', profileId: '1' });
  assert.deepEqual(schema.db.profiles[0], { id: '1', userId: '1' });
});

test('it sets up associations correctly when passing in the association itself', function(assert) {
  let { schema } = this.helper;
  let profile = schema.create('profile');
  let user = schema.create('user', {
    profile
  });

  assert.equal(user.profileId, profile.id);
  assert.deepEqual(user.profile.attrs, profile.attrs);
  assert.deepEqual(profile.user.attrs, user.attrs);
  assert.equal(schema.db.users.length, 1);
  assert.equal(schema.db.profiles.length, 1);
  assert.deepEqual(schema.db.users[0], { id: '1', profileId: '1' });
  assert.deepEqual(schema.db.profiles[0], { id: '1', userId: '1' });
});

test('it throws an error if a model is passed in without a defined relationship', function(assert) {
  let { schema } = this.helper;

  assert.throws(function() {
    schema.create('user', {
      foo: schema.create('foo')
    });
  }, /you haven't defined that key as an association on your model/);
});

test('it throws an error if a collection is passed in without a defined relationship', function(assert) {
  let { schema } = this.helper;
  schema.create('foo');
  schema.create('foo');

  assert.throws(function() {
    schema.create('user', {
      foos: schema.foos.all()
    });
  }, /you haven't defined that key as an association on your model/);
});
