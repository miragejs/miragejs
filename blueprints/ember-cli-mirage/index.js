/*jshint node:true*/

'use strict';

var path = require('path');

module.exports = {
  normalizeEntityName: function() {
    // this prevents an error when the entityName is
    // not specified (since that doesn't actually matter
    // to us
  },

  fileMapTokens: function() {
    return {
      __root__: function(options) {
        if (options.inAddon) {
          return path.join('tests', 'dummy');
        }

        return '/';
      }
    };
  },

  afterInstall: function() {
    var _this = this;

    this.insertIntoFile('.jshintrc', '    "server",', {
      after: '"predef": [\n'
    });

    this.insertIntoFile('tests/.jshintrc', '    "server",', {
      after: '"predef": [\n'
    });

    return this.addPackagesToProject([
      { name: 'ember-lodash', target: '0.0.5' }
    ]).then(function() {
      return _this.addBowerPackagesToProject([
        { name: 'pretender', target: '~0.10.1' },
        { name: 'Faker', target: '~3.0.0' }
      ]);
    });
  }
};
