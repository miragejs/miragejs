import { pluralize } from 'ember-pretenderify/inflector';
import GetController from 'ember-pretenderify/controllers/get';
import store from 'ember-pretenderify/store';

var getController = GetController.create();

module('pretenderify:getController');

test('it exists', function() {
  ok(getController);
});

var contacts = [
  {id: 1, name: 'Link'},
  {id: 2, name: 'Zelda'},
];
var request = {params: {id: 2} };

module('pretenderify:getController#stringHandler', {
  setup: function() {
    store.emptyData();
    store.loadData({contacts: contacts});
  }
});

test("finds the collection if the string is plural and there's no id", function() {
  var data = getController.stringHandler('contacts', store)

  deepEqual(data, {contacts: contacts});
});

test("finds a single model if an id param is present", function() {
  var data = getController.stringHandler('contact', store, request)

  deepEqual(data, {contact: {id: 2, name: 'Zelda'}});
});
