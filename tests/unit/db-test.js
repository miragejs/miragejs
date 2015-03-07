import Db from 'ember-cli-mirage/db';

var db;
module('mirage:db');

test('it can be instantiated', function() {
  db = new Db();
  ok(db);
});


module('mirage:db#loadData', {
  setup: function() {
    db = new Db();
  },
  teardown: function() {
    db.emptyData();
  }
});

test('can load an object as its database', function() {
  var data = {contacts: [{id: 1, name: 'Link'}]};
  db.loadData(data);

  deepEqual(db._data, data);
});

test('can add data to a single key of its database', function() {
  var contacts = [{id: 1, name: 'Link'}];
  db.loadData(contacts, 'contacts');

  deepEqual(db._data, {contacts: contacts});
});


module('mirage:db#find', {
  setup: function() {
    db = new Db();
  },
  teardown: function() {
    db.emptyData();
  }
});

test('returns a record that matches a numerical id', function() {
  db.loadData({
    contacts: [
      {id: 1, name: 'Link'},
      {id: 2, name: 'Zelda'}
    ]
  });

  var contact = db.find('contact', 1);
  deepEqual(contact, {id: 1, name: 'Link'});
});

test('returns a record that matches a string id', function() {
  db.loadData({
    contacts: [
      {id: 'abc', name: 'Link'},
      {id: 'def', name: 'Zelda'}
    ]
  });

  var contact = db.find('contact', 'abc');
  deepEqual(contact, {id: 'abc', name: 'Link'});
});


module('mirage:db#findAll', {
  setup: function() {
    db = new Db();
  },
  teardown: function() {
    db.emptyData();
  }
});

test('returns all records by type', function() {
  var contacts = [
    {id: 1, name: 'Link'},
    {id: 2, name: 'Zelda'}
  ];
  db.loadData({contacts: contacts});

  deepEqual(db.findAll('contact'), contacts);
});

test("returns an empty array if the key doesn't exist", function() {
  deepEqual(db.findAll('contact'), []);
});

test("returns an empty array if no models exist", function() {
  db.loadData({contacts: []});

  deepEqual(db.findAll('contact'), []);
});


module('mirage:db#findQuery', {
  setup: function() {
    db = new Db();
  },
  teardown: function() {
    db.emptyData();
  }
});

test('returns an array of records that match the query', function() {
  var ganon = {id: 3, name: 'Ganon', evil: true};
  db.loadData({
    contacts: [
      {id: 1, name: 'Link', evil: false},
      {id: 2, name: 'Zelda', evil: false},
      ganon
    ]
  });

  var result = db.findQuery('contact', {evil: true});

  deepEqual(result, [ganon]);
});

test('returns an empty array if no records match the query', function() {
  db.loadData({
    contacts: [
      {id: 1, name: 'Link', evil: false},
      {id: 2, name: 'Zelda', evil: false},
      {id: 3, name: 'Ganon', evil: true}
    ]
  });

  var result = db.findQuery('contact', {name: 'Link', evil: true});

  deepEqual(result, []);
});


module('mirage:db#push', {
  setup: function() {
    db = new Db();
  },
  teardown: function() {
    db.emptyData();
  }
});

test('creates a record if no id attr is present', function() {
  var newContact = db.push('contact', {
    name: 'Link'
  });

  var contacts = db.findAll('contact');

  deepEqual(contacts, [{id: 1, name: 'Link'}]);
  deepEqual(newContact, {id: 1, name: 'Link'});
});

test('creates a record if no id attr is present, and sets new id based on max of existing', function() {
  db.loadData({
    contacts: [
      {id: 1, name: 'Link'}
    ]
  });

  db.push('contact', {
    name: 'Zelda'
  });

  var contacts = db.findAll('contact');

  deepEqual(contacts, [
    {id: 1, name: 'Link'},
    {id: 2, name: 'Zelda'}
  ]);
});

test('updates a record if id attr is present', function() {
  db.loadData({
    contacts: [
      {id: 1, name: 'Link'}
    ]
  });

  db.push('contact', {
    id: 1,
    name: 'The Link'
  });

  var link = db.find('contact', 1);

  deepEqual(link, {id: 1, name: 'The Link'});
});

test("doesn't affect data outside the db", function() {
  var contacts = [
    {id: 1, name: 'Link'}
  ];
  db.loadData({contacts: contacts});
  db.push('contact', {
    name: 'Zelda'
  });

  equal(contacts.length, 1);
});


module('mirage:db#remove', {
  setup: function() {
    db = new Db();
  },
  teardown: function() {
    db.emptyData();
  }
});

test('removes a record by type and id', function() {
  db.loadData({
    contacts: [
      {id: 1, name: 'Link'}
    ]
  });

  db.remove('contact', 1);

  deepEqual(db.findAll('contact'), []);
});


module('mirage:db#removeQuery', {
  setup: function() {
    db = new Db();
  },
  teardown: function() {
    db.emptyData();
  }
});

test('removes records that match the query', function() {
  var link = {id: 1, name: 'Link', evil: false};
  var zelda = {id: 1, name: 'Zelda', evil: false};
  db.loadData({
    contacts: [
      link,
      zelda,
      {id: 3, name: 'Ganon', evil: true},
    ]
  });

  db.removeQuery('contact', {evil: true});

  deepEqual(db.findAll('contact'), [link, zelda]);
});
