import {module, test} from 'qunit';
import Db from 'ember-cli-mirage/db';
import ActiveModelSerializer from 'ember-cli-mirage/serializers/active-model-serializer';
import PostShorthandRouteHandler from 'ember-cli-mirage/route-handlers/shorthands/post';

module('Integration | Route Handlers | POST', {
  beforeEach: function() {
    this.db = new Db({
      contacts: []
    });
    this.serializer = new ActiveModelSerializer();
  }
});

test('undefined shorthand works', function(assert) {
  let body = {contact: {first_name: "Ganon"}};
  let request = {requestBody: JSON.stringify(body), url: '/contacts'};
  let handler = new PostShorthandRouteHandler(this.db, this.serializer);

  let result = handler.handle(request);

  assert.equal(this.db.contacts.length, 1);
  assert.deepEqual(result, {contact: {id: 1, first_name: 'Ganon'}});
});

test('string shorthand works', function(assert) {
  let body = {contact: {first_name: "Ganon"}};
  let request = {requestBody: JSON.stringify(body), url: '/people'};
  let handler = new PostShorthandRouteHandler(this.db, this.serializer, 'contact');

  let result = handler.handle(request);

  assert.equal(this.db.contacts.length, 1);
  assert.deepEqual(result, {contact: {id: 1, first_name: 'Ganon'}});
});

test('undefined shorthand works when query params present', function(assert) {
  let body = {contact: {first_name: "Ganon"}};
  let request = {requestBody: JSON.stringify(body), url: '/contacts?foo=bar'};
  let handler = new PostShorthandRouteHandler(this.db, this.serializer);

  let result = handler.handle(request);

  assert.equal(this.db.contacts.length, 1);
  assert.deepEqual(result, {contact: {id: 1, first_name: 'Ganon'}});
});
