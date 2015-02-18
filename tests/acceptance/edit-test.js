import Ember from 'ember';
import EP from 'ember-pretenderify';
import startApp from '../helpers/start-app';

var App;

module('Acceptance: Edit', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test("I can edit a contact", function() {
  var contact = EP.create('contact');
  var addresses = EP.createList('address', {contact: contact});

  visit('/1');
  click('button:contains(Edit)');
  fillIn('input', 'Shiek');
  click('button:contains(Save)');

  andThen(function() {
    equal(currentRouteName(), 'contact');
    equal( find('p:first').text(), 'The contact is Shiek' );
  });
});

