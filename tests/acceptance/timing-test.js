import Ember from 'ember';
import {module, test} from 'qunit';
import startApp from '../helpers/start-app';

var App;
var contact;
var appStore;

module('Acceptance: Timing', {
  beforeEach: function() {
    App = startApp();
    appStore = App.__container__.lookup('store:main');
    contact = server.create('contact');
  },
  afterEach: function() {
    Ember.run(App, 'destroy');
  }
});


// test('delays the response the configured time', function(assert) {
//   var done = assert.async();
//   var startTime = +new Date();
//   server.timing = 600;
//   appStore.findAll('contact').then(function(contacts) {
//     assert.equal(contacts.get('length'), 1);
//     var endTime = +new Date();
//     assert.ok(endTime - startTime >= 600, 'response has beed delayed 600ms');
//     done();
//   });
// });

// test('by default the response is not delayed', function(assert) {
//   var done = assert.async();
//   var startTime = +new Date();
//   appStore.findAll('contact').then(function(contacts) {
//     assert.equal(contacts.get('length'), 1);
//     var endTime = +new Date();
//     assert.ok(endTime - startTime < 150, 'server responds right away');
//     done();
//   });
// });
