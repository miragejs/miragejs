import store from 'ember-pretenderify/store';

module('pretenderify:store', {
  // setup: function() {
  // },
  // teardown: function() {
  // }
});

test('it exists', function() {
  ok(store);
});

test('it can load data', function() {
  var data = {contacts: [{id: 1, name: 'Link'}]};
  store.loadData(data);

  deepEqual(store._data, data);
});

test('it can load data under a single key', function() {
  var contacts = [{id: 1, name: 'Link'}];
  store.loadData(contacts, 'contacts');

  deepEqual(store._data, {contacts: contacts});
});

/*
  find
*/
test('it can find a record by numerical id', function() {
  store.loadData({
    contacts: [
      {id: 1, name: 'Link'},
      {id: 2, name: 'Zelda'}
    ]
  });

  var contact = store.find('contact', 1);
  deepEqual(contact, {id: 1, name: 'Link'});
});

test('it can find a record by string id', function() {
  store.loadData({
    contacts: [
      {id: 'abc', name: 'Link'},
      {id: 'def', name: 'Zelda'}
    ]
  });

  var contact = store.find('contact', 'abc');
  deepEqual(contact, {id: 'abc', name: 'Link'});
});

/*
  findAll
*/
test('it can find all records by type', function() {
  var contacts = [
    {id: 1, name: 'Link'},
    {id: 2, name: 'Zelda'}
  ];
  store.loadData({contacts: contacts});

  deepEqual(store.findAll('contact'), contacts);
});

