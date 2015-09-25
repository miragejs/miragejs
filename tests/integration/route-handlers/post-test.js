import {module, test} from 'qunit';
import PostShorthandRouteHandler from 'ember-cli-mirage/route-handlers/shorthands/post';
import Db from 'ember-cli-mirage/db';

module('Integration | Route Handlers | POST', {
  beforeEach: function() {
    this.db = new Db({
      contacts: []
    });
  }
});

test('undefined shorthand works', function(assert) {
  let body = {contact: {name: "Ganon"}};
  let request = {requestBody: JSON.stringify(body), url: '/contacts'};
  let handler = new PostShorthandRouteHandler(this.db);

  let result = handler.handle(request);

  assert.equal(this.db.contacts.length, 1);
  assert.deepEqual(result, {contact: {id: 1, name: 'Ganon'}});
});

test('string shorthand works', function(assert) {
  let body = {contact: {name: "Ganon"}};
  let request = {requestBody: JSON.stringify(body), url: '/people'};
  let handler = new PostShorthandRouteHandler(this.db, 'contact');

  let result = handler.handle(request);

  assert.equal(this.db.contacts.length, 1);
  assert.deepEqual(result, {contact: {id: 1, name: 'Ganon'}});
});

test('undefined shorthand works when query params present', function(assert) {
  let body = {contact: {name: "Ganon"}};
  let request = {requestBody: JSON.stringify(body), url: '/contacts?foo=bar'};
  let handler = new PostShorthandRouteHandler(this.db);

  let result = handler.handle(request);

  assert.equal(this.db.contacts.length, 1);
  assert.deepEqual(result, {contact: {id: 1, name: 'Ganon'}});
});
