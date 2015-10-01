import Ember from 'ember';
import {module, test} from 'qunit';
import startApp from '../helpers/start-app';

var App;

module('Acceptance: Edit', {
  beforeEach: function() {
    App = startApp();
  },
  afterEach: function() {
    server.shutdown();
    Ember.run(App, 'destroy');
  }
});

test("I can edit a contact", function(assert) {
  server.create('contact');

  visit('/1');
  click('button:contains(Edit)');
  fillIn('input', 'Shiek');
  click('button:contains(Save)');

  andThen(function() {
    assert.equal(currentRouteName(), 'contact');
    assert.equal( find('p:first').text(), 'The contact is Shiek' );
  });
});

