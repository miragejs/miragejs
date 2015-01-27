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
  visit('/');

  andThen(function() {
    equal(currentRouteName(), 'index');
    equal( find('p').text(), 'Legos' );
  });
});


