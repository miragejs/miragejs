/*jshint node:true*/

'use strict';

var path = require('path');

module.exports = {
  description: 'Generates a Mirage fixture.',

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
  }

};
