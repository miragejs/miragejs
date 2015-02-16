import Ember from 'ember';
import startApp from '../helpers/start-app';

var App;

module('Acceptance: Contact', {
  setup: function() {
    App = startApp();
    store.loadData({
      contacts: [
        {id: 1, name: 'Link'},
        {id: 2, name: 'Zelda'}
      ]
    });
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test("I can view a contact", function() {
  visit('/2');

  andThen(function() {
    equal(currentRouteName(), 'contact');
    equal( find('p:first').text(), 'The contact is Zelda' );
  });
});

test("I can delete a contact", function() {
  visit('/2');
  click('button:contains(Delete)');

  andThen(function() {
    equal(currentRouteName(), 'contacts');
    equal( find('p').length, 1 );
  });
});


