import Ember from 'ember';
import startApp from '../helpers/start-app';

var App;
var friends;

module('Acceptance: Contacts', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test("I can view the friends", function() {
  var friend = server.create('friend');
  var youngFriend = server.create('friend', {name: 'Tommy', age: 10});

  visit('/friends');

  andThen(function() {
    equal(currentRouteName(), 'friends');
    equal( find('p').length, 2 );
    equal(friend.is_young, false);
    equal(youngFriend.is_young, true);

    ok( find('p:first').text().match(friend.name) );
    ok( find('p:first').text().match(friend.age) );
    ok( find('p:last').text().match('Tommy') );
    ok( find('p:last').text().match(10) );
  });
});
