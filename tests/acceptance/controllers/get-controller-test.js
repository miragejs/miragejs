import Ember from 'ember';
import startApp from '../../helpers/start-app';
import config from '../../../app/ember-pretenderify/config';

var App;

module('Acceptance: GetController', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test("it works", function() {

  ok(0);

});

