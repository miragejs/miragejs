import { Model, belongsTo } from 'ember-cli-mirage';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import { module, test } from 'qunit';

module('Integration | ORM | Schema Verification | Belongs To');

test('a one-way belongsTo association is correct', function(assert) {
  let schema = new Schema(new Db({
    authors: [
      { id: 1, name: 'Frodo' }
    ],
    posts: [
      { id: 1, title: 'Lorem ipsum' }
    ]
  }), {
    author: Model.extend(),
    post: Model.extend({
      author: belongsTo()
    })
  });

  let post = schema.posts.find(1);
  let association = post.associationFor('author');
  let frodo = schema.authors.find(1);

  assert.equal(association.key, 'author');
  assert.equal(association.modelName, 'author');
  assert.equal(association.ownerModelName, 'post');
  assert.ok(frodo.inverseFor(association) === null, 'there is no inverse');
});

test('a one-way named belongsTo association is correct', function(assert) {
  let schema = new Schema(new Db({
    users: [
      { id: 1, name: 'Frodo' }
    ],
    posts: [
      { id: 1, title: 'Lorem ipsum' }
    ]
  }), {
    user: Model.extend(),
    post: Model.extend({
      author: belongsTo('user')
    })
  });

  let post = schema.posts.find(1);
  let association = post.associationFor('author');
  let frodo = schema.users.find(1);

  assert.equal(association.key, 'author');
  assert.equal(association.modelName, 'user');
  assert.equal(association.ownerModelName, 'post');
  assert.ok(frodo.inverseFor(association) === null, 'there is no inverse');
});

test('a reflexive belongsTo association is correct and has an implicit inverse', function(assert) {
  let schema = new Schema(new Db({
    users: [
      { id: 1, name: 'Frodo' }
    ]
  }), {
    user: Model.extend({
      user: belongsTo()
    })
  });

  let frodo = schema.users.find(1);
  let association = frodo.associationFor('user');

  assert.equal(association.key, 'user');
  assert.equal(association.modelName, 'user');
  assert.equal(association.ownerModelName, 'user');
  assert.ok(frodo.inverseFor(association) === association, 'the implicit inverse was found');
});

test('a named reflexive belongsTo association with an implicit inverse is correct', function(assert) {
  let schema = new Schema(new Db({
    users: [
      { id: 1, name: 'Frodo' }
    ]
  }), {
    user: Model.extend({
      bestFriend: belongsTo('user')
    })
  });

  let frodo = schema.users.find(1);
  let association = frodo.associationFor('bestFriend');

  assert.equal(association.key, 'bestFriend');
  assert.equal(association.modelName, 'user');
  assert.equal(association.ownerModelName, 'user');
  assert.ok(frodo.inverseFor(association) === association, 'the implicit inverse was found');
});

test('a named reflexive belongsTo association with an explicit inverse is correct', function(assert) {
  let schema = new Schema(new Db({
    users: [
      { id: 1, name: 'Frodo' }
    ]
  }), {
    user: Model.extend({
      bestFriend: belongsTo('user', { inverse: 'bestFriend' })
    })
  });

  let frodo = schema.users.find(1);
  let association = frodo.associationFor('bestFriend');

  assert.equal(association.key, 'bestFriend');
  assert.equal(association.modelName, 'user');
  assert.equal(association.ownerModelName, 'user');
  assert.ok(frodo.inverseFor(association) === association, 'the explicit inverse was found');
});

test('a one-way reflexive belongsTo association with a null inverse is correct', function(assert) {
  let schema = new Schema(new Db({
    users: [
      { id: 1, name: 'Frodo' }
    ]
  }), {
    user: Model.extend({
      user: belongsTo('user', { inverse: null })
    })
  });

  let frodo = schema.users.find(1);
  let association = frodo.associationFor('user');

  assert.equal(association.key, 'user');
  assert.equal(association.modelName, 'user');
  assert.equal(association.ownerModelName, 'user');
  assert.ok(frodo.inverseFor(association) === null, 'there is no inverse');
});

test('a named one-way way reflexive belongsTo association with a null inverse is correct', function(assert) {
  let schema = new Schema(new Db({
    users: [
      { id: 1, name: 'Frodo' }
    ]
  }), {
    user: Model.extend({
      parent: belongsTo('user', { inverse: null })
    })
  });

  let frodo = schema.users.find(1);
  let association = frodo.associationFor('parent');

  assert.equal(association.key, 'parent');
  assert.equal(association.modelName, 'user');
  assert.equal(association.ownerModelName, 'user');
  assert.ok(frodo.inverseFor(association) === null, 'there is no inverse');
});

test('a one-to-one belongsTo association with an implicit inverse is correct', function(assert) {
  let schema = new Schema(new Db({
    users: [
      { id: 1, name: 'Frodo' }
    ],
    profiles: [
      { id: 1, type: 'Admin' }
    ]
  }), {
    user: Model.extend({
      profile: belongsTo()
    }),
    profile: Model.extend({
      user: belongsTo()
    })
  });

  let admin = schema.profiles.find(1);
  let association = admin.associationFor('user');

  assert.equal(association.key, 'user');
  assert.equal(association.modelName, 'user');
  assert.equal(association.ownerModelName, 'profile');

  let frodo = schema.users.find(1);
  let inverse = frodo.inverseFor(association);

  assert.equal(inverse.key, 'profile');
  assert.equal(inverse.modelName, 'profile');
  assert.equal(inverse.ownerModelName, 'user');
});
