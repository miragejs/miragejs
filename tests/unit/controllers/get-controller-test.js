import { pluralize } from 'ember-pretenderify/inflector';
import GetController from 'ember-pretenderify/controllers/get';

var getController = GetController.create();

module('pretenderify:getController');

test('it exists', function() {
  ok(getController);
});

module('pretenderify:getController#stringHandler');

var contacts = [
  {id: 1, name: 'Link'},
  {id: 2, name: 'Zelda'},
];
var store = {
  _data: {contacts: contacts},
  find: function(type, id) {
    var key = pluralize(type);
    return this._data[key].findBy('id', id);
  },
  findAll: function(key) {
    return this._data[key];
  }
};
var request = {params: {id: 2} };

test("finds the collection if the string is plural and there's no id", function() {
  var data = getController.stringHandler('contacts', store)

  deepEqual(data, {contacts: contacts});
});

test("finds a single model the string is singular and there's an id", function() {
  var data = getController.stringHandler('contact', store, request)

  deepEqual(data, {contact: {id: 2, name: 'Zelda'}});
});
