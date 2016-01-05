import {module, test} from 'qunit';
import Server from 'ember-cli-mirage/server';
import Response from 'ember-cli-mirage/response';

module('Integration | Response string', {
  beforeEach: function() {
    this.server = new Server({
      environment: 'development'
    });
    this.server.timing = 0;
    this.server.logging = false;
  },
  afterEach: function() {
    this.server.shutdown();
  }
});

test('mirage response string is not serialized to string', function(assert) {
  assert.expect(1);
  var done = assert.async();

  this.server.get('/contacts', function() {
    return new Response(200, {'Content-Type': 'text/csv'}, "firstname,lastname\nbob,dylon");
  });

  $.ajax({
    method: 'GET',
    url: '/contacts'
  }).done(function(res) {
    assert.equal(res, "firstname,lastname\nbob,dylon");
    done();
  });
});
