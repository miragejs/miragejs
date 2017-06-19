/* eslint-env node */

'use strict';

var path = require('path');
var existsSync = require('exists-sync');
var chalk = require('chalk');
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

  insertServerIntoESLintrc: function() {
    // Insert server to globals declaration in eslintrc file.
    // If globals declaration is not present insert it.
    var text = '    server: true,';
    var after = 'globals: {\n';

    return this.insertIntoFile('.eslintrc.js', text, { after: after }).then(() => {
      text = '  globals: {\n    server: true,\n  },';
      after = 'module.exports = {\n';

      return this.insertIntoFile('.eslintrc.js', text, { after: after });
    });
  },

  insertServerIntoJSHintrc: function() {
    var text = '    "server",';
    var after = '"predef": [\n';

    return this.insertIntoFile('.jshintrc', text, { after: after });
  },

  insertShutdownIntoDestroyApp: function() {
    if (existsSync('tests/helpers/destroy-app.js')) {
      var shutdownText = '  if (window.server) {\n    window.server.shutdown();\n  }';
      return this.insertIntoFile('tests/helpers/destroy-app.js', shutdownText, {
        after: "Ember.run(application, 'destroy');\n"
      });
    } else {
      this.ui.writeLine(
        EOL +
        chalk.yellow(
          '******************************************************' + EOL +
          'destroy-app.js helper is not present. Please read this' + EOL +
          'https://gist.github.com/blimmer/35d3efbb64563029505a' + EOL +
          'to see how to fix the problem.' + EOL +
          '******************************************************' + EOL
        )
      );
    }
  },

  afterInstall: function() {
    return this.insertServerIntoESLintrc().then(() => {
      return this.insertServerIntoJSHintrc().then(() => {
        return this.insertShutdownIntoDestroyApp();
      });
    });
  }
};
