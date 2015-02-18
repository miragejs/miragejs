import Factory from 'ember-pretenderify/factory';

module('pretenderify:factory');

test('it exists', function() {
  ok(Factory);
});

test('it works with strings and numbers', function() {
  var factory = Factory.define({
    name: 'Sam',
    age: 28,
  });

  var data = factory();

  deepEqual(data, {name: 'Sam', age: 28});
});

test('it has access to its own plain attrs', function() {
  var factory1 = Factory.define({
    name: 'Sam',
    age: 28,
    admin: function(n) {
      return this.age > 30;
    }
  });
  var factory2 = Factory.define({
    name: 'Gandalf',
    age: 500,
    admin: function() {
      return this.age > 30;
    },
  });

  var sam = factory1();
  var gandalf = factory2();

  deepEqual(sam, {name: 'Sam', age: 28, admin: false});
  deepEqual(gandalf, {name: 'Gandalf', age: 500, admin: true});
});

test('it has access to its sequence', function() {
  var factory = Factory.define({
    name: 'Sam',
    age: 28,
    email: function(n) {
      return `person${n}@test.com`;
    }
  });

  var data1 = factory(1);
  var data2 = factory(2);

  deepEqual(data1, {name: 'Sam', age: 28, email: 'person1@test.com'});
  deepEqual(data2, {name: 'Sam', age: 28, email: 'person2@test.com'});
});
