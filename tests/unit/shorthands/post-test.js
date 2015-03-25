import post from 'ember-cli-mirage/shorthands/post';
import Db from 'ember-cli-mirage/orm/db';

import {module, test} from 'qunit';

var db;
module('mirage:shorthands#post', {
  beforeEach: function() {
    db = new Db();
    db.createCollection('contacts');
  }
});

test("string shorthand works", function(assert) {
  var body = '{"contact":{"name":"Ganon"}}';
  var result = post.string('contact', db, {requestBody: body});

  var contactsInDb = db.contacts.all();
  assert.equal(contactsInDb.length, 1);
  assert.deepEqual(result, {contact: {id: 1, name: 'Ganon'}});
});

test("undefined shorthand works", function(assert) {
  var body = '{"contact":{"name":"Ganon"}}';
  var result = post.undefined(undefined, db, {requestBody: body, url: '/contacts'});

  var contactsInDb = db.contacts.all();
  assert.equal(contactsInDb.length, 1);
  assert.deepEqual(result, {contact: {id: 1, name: 'Ganon'}});
});

test("undefined shorthand works when query params present", function(assert) {
  var body = '{"contact":{"name":"Ganon"}}';
  var result = post.undefined(undefined, db, {requestBody: body, url: '/contacts?foo=bar'});

  var contactsInDb = db.contacts.all();
  assert.equal(contactsInDb.length, 1);
  assert.deepEqual(result, {contact: {id: 1, name: 'Ganon'}});
});

