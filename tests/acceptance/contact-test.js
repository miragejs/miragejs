import Ember from 'ember';
import startApp from '../helpers/start-app';

var App;
var contact;

module('Acceptance: Contact', {
  setup: function() {
    App = startApp();
    contact = server.create('contact');
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test("I can view a contact", function() {
  visit('/1');

  andThen(function() {
    equal(currentRouteName(), 'contact');
    equal( find('p:first').text(), 'The contact is ' + contact.name );
  });
});

test("I can delete a contact", function() {
  visit('/1');
  click('button:contains(Delete)');

  andThen(function() {
    equal(currentRouteName(), 'contacts');
    equal( find('p').length, 0 );
  });
});


