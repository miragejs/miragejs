import { Model, belongsTo } from 'ember-cli-mirage';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import { module, test } from 'qunit';

module('Integration | ORM | Schema Verification | Belongs To');

test('a one-way belongsTo association is correct', function(assert) {
  let schema = new Schema(new Db(), {
    author: Model.extend(),
    post: Model.extend({
      author: belongsTo()
    })
  });

  let association = schema.modelClassFor('post').associationFor('author');

  assert.equal(association.key, 'author');
  assert.equal(association.modelName, 'author');
  assert.equal(association.ownerModelName, 'post');
  assert.ok(association.inverse() === null, 'there is no inverse');
});

test('a one-way named belongsTo association is correct', function(assert) {
  let schema = new Schema(new Db(), {
    user: Model.extend(),
    post: Model.extend({
      author: belongsTo('user')
    })
  });

  let association = schema.modelClassFor('post').associationFor('author');

  assert.equal(association.key, 'author');
  assert.equal(association.modelName, 'user');
  assert.equal(association.ownerModelName, 'post');
  assert.ok(association.inverse() === null, 'there is no inverse');
});

test('a reflexive belongsTo association is correct and has an implicit inverse', function(assert) {
  let schema = new Schema(new Db(), {
    user: Model.extend({
      user: belongsTo()
    })
  });

  let association = schema.modelClassFor('user').associationFor('user');

  assert.equal(association.key, 'user');
  assert.equal(association.modelName, 'user');
  assert.equal(association.ownerModelName, 'user');
  assert.ok(association.inverse() === association, 'the implicit inverse was found');
});

test('a named reflexive belongsTo association with an implicit inverse is correct', function(assert) {
  let schema = new Schema(new Db(), {
    user: Model.extend({
      bestFriend: belongsTo('user')
    })
  });

  let association = schema.modelClassFor('user').associationFor('bestFriend');

  assert.equal(association.key, 'bestFriend');
  assert.equal(association.modelName, 'user');
  assert.equal(association.ownerModelName, 'user');
  assert.ok(association.inverse() === association, 'the implicit inverse was found');
});

test('a named reflexive belongsTo association with an explicit inverse is correct', function(assert) {
  let schema = new Schema(new Db(), {
    user: Model.extend({
      bestFriend: belongsTo('user', { inverse: 'bestFriend' })
    })
  });

  let association = schema.modelClassFor('user').associationFor('bestFriend');

  assert.equal(association.key, 'bestFriend');
  assert.equal(association.modelName, 'user');
  assert.equal(association.ownerModelName, 'user');
  assert.ok(association.inverse() === association, 'the implicit inverse was found');
});

test('a one way reflexive belongsTo association with a null inverse is correct', function(assert) {
  let schema = new Schema(new Db(), {
    user: Model.extend({
      user: belongsTo('user', { inverse: null })
    })
  });

  let association = schema.modelClassFor('user').associationFor('user');

  assert.equal(association.key, 'user');
  assert.equal(association.modelName, 'user');
  assert.equal(association.ownerModelName, 'user');
  assert.ok(association.inverse() === null, 'there is no inverse');
});

test('a named way reflexive belongsTo association with a null inverse is correct', function(assert) {
  let schema = new Schema(new Db(), {
    user: Model.extend({
      parent: belongsTo('user', { inverse: null })
    })
  });

  let association = schema.modelClassFor('user').associationFor('parent');

  assert.equal(association.key, 'parent');
  assert.equal(association.modelName, 'user');
  assert.equal(association.ownerModelName, 'user');
  assert.ok(association.inverse() === null, 'there is no inverse');
});

test('a one to one belongsTo association with an implicit inverse is correct', function(assert) {
  let schema = new Schema(new Db(), {
    user: Model.extend({
      profile: belongsTo()
    }),
    profile: Model.extend({
      user: belongsTo()
    })
  });

  let association = schema.modelClassFor('profile').associationFor('user');

  assert.equal(association.key, 'user');
  assert.equal(association.modelName, 'user');
  assert.equal(association.ownerModelName, 'profile');

  let inverse = association.inverse();

  assert.equal(inverse.key, 'profile');
  assert.equal(inverse.modelName, 'profile');
  assert.equal(inverse.ownerModelName, 'user');
});
