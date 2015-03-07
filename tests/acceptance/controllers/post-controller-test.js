import Ember from 'ember';
import startApp from '../../helpers/start-app';
import controller from 'ember-cli-mirage/controllers/front';
import Db from 'ember-cli-mirage/db';

var App;
var db;

module('mirage:frontController POST', {
  setup: function() {
    App = startApp();
    db = new Db();
    db.emptyData();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test("string shorthand works", function() {
  var body = '{"contact":{"name":"Ganon"}}';
  var result = controller.handle('post', 'contact', db, {requestBody: body});

  var contactsInDb = db.findAll('contact');
  equal(contactsInDb.length, 1);
  deepEqual(result[2], {contact: {id: 1, name: 'Ganon'}});
});

test("undefined shorthand works", function() {
  var body = '{"contact":{"name":"Ganon"}}';
  var result = controller.handle('post', undefined, db, {requestBody: body, url: '/contacts'});

  var contactsInDb = db.findAll('contact');
  equal(contactsInDb.length, 1);
  deepEqual(result[2], {contact: {id: 1, name: 'Ganon'}});
});
