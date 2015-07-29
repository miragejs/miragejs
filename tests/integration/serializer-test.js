import Schema from 'ember-cli-mirage/orm/schema';
import Model from 'ember-cli-mirage/orm/model';
import Db from 'ember-cli-mirage/db';
import Serializer from 'ember-cli-mirage/serializer';
import { camelize } from 'ember-cli-mirage/utils/inflector';
import {module, test} from 'qunit';

let db = new Db();
let schema = new Schema(db);
schema.registerModel('user', Model.extend());

function getUserModel(attrs) {
  return schema.user.create(attrs);
}

function getUserCollection(attrsArray) {
  attrsArray.forEach(attrs => {
    schema.user.create(attrs);
  });
  return schema.user.all();
}

module('mirage:serializer - Base', {
  beforeEach() {
    this.serializer = new Serializer();
  },
  afterEach() {
    schema.db.emptyData();
  }
});

test('it returns pojos unaffected', function(assert) {
  var result = this.serializer.serialize({oh: 'hai'});

  assert.deepEqual(result, {oh: 'hai'});
});

test('it returns arrays unaffected', function(assert) {
  var data = [{id: 1, name: 'Link'}, {id: 2, name: 'Zelda'}];
  var result = this.serializer.serialize(data);

  assert.deepEqual(result, data);
});

test(`it serializes a model by returning its attrs`, function(assert) {
  var user = getUserModel({
    id: 1,
    name: 'Link',
    age: 323,
  });

  var result = this.serializer.serialize(user);
  assert.deepEqual(result, {
    id: 1,
    name: 'Link',
    age: 323
  });
});

test(`it serializes a collection of models by returning an array of their attrs`, function(assert) {
  var collection = getUserCollection([
    {id: 1, name: 'Link', age: 323},
    {id: 2, name: 'Zelda', age: 401}
  ]);

  var result = this.serializer.serialize(collection);
  assert.deepEqual(result, [
    {id: 1, name: 'Link', age: 323},
    {id: 2, name: 'Zelda', age: 401}
  ]);
});

test(`it serializes a collection of models by returning an array of their attrs`, function(assert) {
  var collection = getUserCollection([
    {id: 1, name: 'Link', age: 323},
    {id: 2, name: 'Zelda', age: 401}
  ]);

  var result = this.serializer.serialize(collection);
  assert.deepEqual(result, [
    {id: 1, name: 'Link', age: 323},
    {id: 2, name: 'Zelda', age: 401}
  ]);
});

module('mirage:serializer - root:true', {
  beforeEach() {
    const MySerializer = Serializer.extend({
      root: true
    });
    this.serializer = new MySerializer();
  },
  afterEach() {
    schema.db.emptyData();
  }
});

test(`if root is true, it serializes a model by returning its attrs under a key of the model's type`, function(assert) {
  var user = getUserModel({
    id: 1,
    name: 'Link',
    age: 323,
  });

  var result = this.serializer.serialize(user);
  assert.deepEqual(result, {
    user: {
      id: 1,
      name: 'Link',
      age: 323
    }
  });
});

test(`if root is true, it serializes a collection of models by returning an array of their attrs under a pluralized key`, function(assert) {
  var collection = getUserCollection([
    {id: 1, name: 'Link', age: 323},
    {id: 2, name: 'Zelda', age: 401}
  ]);

  var result = this.serializer.serialize(collection);
  assert.deepEqual(result, {
    users: [
      {id: 1, name: 'Link', age: 323},
      {id: 2, name: 'Zelda', age: 401}
    ]
  });
});

module('mirage:serializer - overriding serialize', {
  beforeEach: function() {
    const MySerializer = Serializer.extend({
      serialize(response, request) {
        return 'blah';
      }
    });
    this.serializer = new MySerializer();
  }
});

test(`it can use a completely custom serialize function`, function(assert) {
  var user = getUserModel({
    id: 1,
    name: 'Link',
    age: 323,
  });

  var result = this.serializer.serialize(user);
  assert.equal(result, 'blah');
});

module('mirage:serializer - key formatting', {
  beforeEach() {
    let MySerializer = Serializer.extend({
      keyForAttribute(key) {
        return camelize(key);
      }
    });
    this.serializer = new MySerializer();
  },
  afterEach() {
    schema.db.emptyData();
  }
});

test(`keyForAttribute formats the attributes of a model`, function(assert) {
  var user = getUserModel({
    id: 1,
    'first-name': 'Link',
    'last-name': 'Jackson',
    age: 323,
  });

  let result = this.serializer.serialize(user);

  assert.deepEqual(result, {
    id: 1,
    firstName: 'Link',
    lastName: 'Jackson',
    age: 323
  });
});

test(`keyForAttribute also formats the models in a collections`, function(assert) {
  var user = getUserCollection([
    {id: 1, 'first-name': 'Link', 'last-name': 'Jackson'},
    {id: 2, 'first-name': 'Zelda', 'last-name': 'Brown'}
  ]);

  let result = this.serializer.serialize(user);

  assert.deepEqual(result, [
    {id: 1, firstName: 'Link', lastName: 'Jackson'},
    {id: 2, firstName: 'Zelda', lastName: 'Brown'}
  ]);
});


module('mirage:serializer - attrs list', {
  beforeEach: function() {
    const MySerializer = Serializer.extend({
      attrs: ['id', 'name']
    });
    this.serializer = new MySerializer();
  },
  afterEach() {
    schema.db.emptyData();
  }
});

test(`it returns only the whitelisted attrs when serializing a model`, function(assert) {
  var user = getUserModel({
    id: 1,
    name: 'Link',
    age: 323,
  });

  var result = this.serializer.serialize(user);
  assert.deepEqual(result, {
    id: 1,
    name: 'Link'
  });
});

test(`it returns only the whitelisted attrs when serializing a collection`, function(assert) {
  var collection = getUserCollection([
    {id: 1, name: 'Link', age: 323},
    {id: 2, name: 'Zelda', age: 401}
  ]);

  var result = this.serializer.serialize(collection);
  assert.deepEqual(result, [
    {id: 1, name: 'Link'},
    {id: 2, name: 'Zelda'}
  ]);
});
