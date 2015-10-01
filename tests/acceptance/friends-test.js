import Ember from 'ember';
import {module, test} from 'qunit';
import startApp from '../helpers/start-app';

var App;

module('Acceptance: Friends', {
  beforeEach: function() {
    App = startApp();
  },
  afterEach: function() {
    server.shutdown();
    Ember.run(App, 'destroy');
  }
});

test("I can view the friends", function(assert) {
  var friend = server.create('friend');
  var youngFriend = server.create('friend', {name: 'Tommy', age: 10});

  visit('/friends');

  andThen(function() {
    assert.equal(currentRouteName(), 'friends');
    assert.equal( find('p').length, 2 );
    assert.equal(friend.is_young, false);
    assert.equal(youngFriend.is_young, true);

    assert.ok( find('p:first').text().match(friend.name) );
    assert.ok( find('p:first').text().match(friend.age) );
    assert.ok( find('p:last').text().match('Tommy') );
    assert.ok( find('p:last').text().match(10) );
  });
});

test("I can view the selected friends", function(assert) {
  server.create('friend', { name: 'Jane', age: 30 });
  server.create('friend', { name: 'Tommy', age: 10});
  server.create('friend', { name: 'Bob', age: 28 });

  visit('/close-friends');

  andThen(function() {
    assert.equal(currentRouteName(), 'close-friends');
    assert.equal( find('p').length, 2 );

    assert.ok( find('p:first').text().match('Jane') );
    assert.ok( find('p:first').text().match(30) );
    assert.ok( find('p:last').text().match('Bob') );
    assert.ok( find('p:last').text().match(28) );
  });
});

test("I can view a friend that was configured only for test mode", function(assert) {
  var friend = server.create('friend', { name: 'The Dude' });

  visit('/friends/' + friend.id);

  andThen(function() {
    assert.equal(currentRouteName(), 'friend');
    assert.ok( find('h2.friend-name').text().match('The Dude') );
  });
});
