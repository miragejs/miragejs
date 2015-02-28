import Ember from 'ember';
import startApp from '../../helpers/start-app';
import controller from 'ember-cli-mirage/controllers/front';
import Store from 'ember-cli-mirage/store';

var App;
var contacts = [{id: 1, name: 'Link', address_ids: [1]}, {id: 2, name: 'Zelda', address_ids: [2]}];
var addresses = [{id: 1, name: '123 Hyrule Way', contact_id: 1}, {id: 2, name: '456 Hyrule Way', contact_id: 2}];
var store;

module('mirage:frontController PUT', {
  setup: function() {
    App = startApp();
    store = new Store();
    store.loadData({
      contacts: contacts,
      addresses: addresses
    });
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test("string shorthand works", function() {
  var Link = store.find('contact', 1);
  equal(Link.name, 'Link');

  var body = '{"contact":{"id":1,"name":"Linkz0r"}}';
  var result = controller.handle('put', 'contact', store, {params: {id: 1}, requestBody: body});

  Link = store.find('contact', 1);
  equal(Link.name, 'Linkz0r');
});

test("undefined shorthand works", function() {
  var Link = store.find('contact', 1);
  equal(Link.name, 'Link');

  var body = '{"contact":{"id":1,"name":"Linkz0r"}}';
  var result = controller.handle('put', undefined, store, {params: {id: 1}, url: '/contacts/1', requestBody: body});

  Link = store.find('contact', 1);
  equal(Link.name, 'Linkz0r');
});
