import Ember from 'ember';
import startApp from '../../helpers/start-app';
import controller from 'ember-cli-mirage/controllers/front';
import Store from 'ember-cli-mirage/store';

var App;
var store;

module('mirage:frontController POST', {
  setup: function() {
    App = startApp();
    store = new Store();
    store.emptyData();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test("string shorthand works", function() {
  var body = '{"contact":{"name":"Ganon"}}';
  var result = controller.handle('post', 'contact', store, {requestBody: body});

  var contactsInStore = store.findAll('contact');
  equal(contactsInStore.length, 1);
  deepEqual(result[2], {contact: {id: 1, name: 'Ganon'}});
});

test("undefined shorthand works", function() {
  var body = '{"contact":{"name":"Ganon"}}';
  var result = controller.handle('post', undefined, store, {requestBody: body, url: '/contacts'});

  var contactsInStore = store.findAll('contact');
  equal(contactsInStore.length, 1);
  deepEqual(result[2], {contact: {id: 1, name: 'Ganon'}});
});
