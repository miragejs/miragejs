import Ember from 'ember';
import startApp from '../helpers/start-app';

var App;
var contacts;

module('Acceptance: Contacts', {
  setup: function() {
    App = startApp();
    contacts = server.createList('contact', 2);
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test("I can view the contacts", function() {
  visit('/');

  andThen(function() {
    equal(currentRouteName(), 'contacts');
    equal( find('p').length, 2 );
    equal( find('p:first').text(), contacts[0].name );
  });
});

test("I can create a new contact", function() {
  visit('/');
  fillIn('input', 'Ganon');
  click('button:contains(Create)');

  andThen(function() {
    equal(currentRouteName(), 'contacts');
    equal( find('p').length, 3 );
    equal( find('p:last').text(), 'Ganon' );
  });
});
