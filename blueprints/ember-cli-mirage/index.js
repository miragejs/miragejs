/* eslint-env node */

'use strict';

var path = require('path');
var fs = require('fs');
var EOL = require('os').EOL;

module.exports = {
  normalizeEntityName: function() {
    // this prevents an error when the entityName is
    // not specified (since that doesn't actually matter
    // to us
  },

  fileMapTokens: function() {
    var self = this;
    return {
      __root__: function(options) {
        if (!!self.project.config()['ember-cli-mirage'] && !!self.project.config()['ember-cli-mirage'].directory) {
          return self.project.config()['ember-cli-mirage'].directory;
        } else if (options.inAddon) {
          return path.join('tests', 'dummy', 'mirage');
        } else {
          return '/mirage';
        }
      }
    };
  },

  insertShutdownIntoDestroyApp: function() {
    if (fs.existsSync('tests/helpers/destroy-app.js')) {
      var shutdownText = '  if (window.server) {\n    window.server.shutdown();\n  }';
      return this.insertIntoFile('tests/helpers/destroy-app.js', shutdownText, {
        after: "run(application, 'destroy');\n"
      });
    }
  },

  afterInstall: function() {
    return this.insertShutdownIntoDestroyApp();
  }
};
