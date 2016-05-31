/*jshint node:true*/

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

  afterInstall: function() {
    this.insertIntoFile('.jshintrc', '    "server",', {
      after: '"predef": [\n'
    });

    this.insertIntoFile('tests/.jshintrc', '    "server",', {
      after: '"predef": [\n'
    });

    if (existsSync('tests/helpers/destroy-app.js')) {
      this.insertIntoFile('tests/helpers/destroy-app.js', '  server.shutdown();', {
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

    return this.addBowerPackagesToProject([{
      name: 'pretender',
      target: '~1.1.0'
    }, {
      name: 'Faker',
      target: '~3.1.0'
    }]);
  }
};
