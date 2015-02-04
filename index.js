'use strict';
var path = require('path');

module.exports = {
  name: 'ember-pretenderify',

  included: function included(app) {
    this.app = app;

    app.import(app.bowerDirectory + '/FakeXMLHttpRequest/fake_xml_http_request.js');
    app.import(app.bowerDirectory + '/route-recognizer/dist/route-recognizer.js');
    app.import(app.bowerDirectory + '/pretender/pretender.js');
    app.import('vendor/ember-pretenderify/shim.js', {
      type: 'vendor',
      exports: { 'pretender': ['default'] }
    });
  },

  blueprintsPath: function() {
    return path.join(__dirname, 'blueprints');
  },
};
