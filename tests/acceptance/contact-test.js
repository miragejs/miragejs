import Ember from 'ember';
import {module, test} from 'qunit';
import startApp from '../helpers/start-app';

var App;
var contact;

module('Acceptance: Contact', {
  beforeEach: function() {
    App = startApp();
    contact = server.create('contact');
  },
  afterEach: function() {
    server.shutdown();
    Ember.run(App, 'destroy');
  }
});

test("I can view a contact", function(assert) {
  visit('/1');

  andThen(function() {
    assert.equal(currentRouteName(), 'contact');
    assert.equal( find('p:first').text(), 'The contact is ' + contact.name );
  });
});

test("I can delete a contact", function(assert) {
  visit('/1');
  click('button:contains(Delete)');

  andThen(function() {
    assert.equal(currentRouteName(), 'contacts');
    assert.equal( find('p').length, 0 );
  });
});


