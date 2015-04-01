import Ember from 'ember';
import {module, test} from 'qunit';
import startApp from '../helpers/start-app';

var App;
var friends;

module('Acceptance: Contacts', {
  beforeEach: function() {
    App = startApp();
  },
  afterEach: function() {
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
