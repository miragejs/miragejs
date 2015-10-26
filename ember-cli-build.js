/* jshint node: true */
/* global require, module */

var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
var pickFiles = require('broccoli-static-compiler');
var path = require('path');


/*
  This Brocfile specifes the options for the dummy test app of this
  addon, located in `/tests/dummy`

  This Brocfile does *not* influence how the addon or the app using it
  behave. You most likely want to be modifying `./index.js` or app's Brocfile
*/

module.exports = function(defaults) {
  var app = new EmberAddon({
    'ember-cli-mirage': {
      directory: path.resolve(__dirname, path.join('tests', 'dummy', 'mirage'))
    }
  });

  var es5Shim = pickFiles('node_modules/es5-shim', {
    srcDir: '/',
    files: ['es5-shim.js'],
    destDir: '/assets'
  });

  return app.toTree([es5Shim]);
}
