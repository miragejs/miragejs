import Ember from 'ember';
import startApp from '../helpers/start-app';

var App;

module('Acceptance: App', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test("I can view the models", function() {
  serverData.contacts = [
    {
      id: 1,
      name: 'Link'
    }
  ];

  visit('/');

  andThen(function() {
    equal(currentRouteName(), 'contacts');
    equal( find('p').text(), 'Link' );
  });
});


