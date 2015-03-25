/* jshint node: true */
/* global require, module */

var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
var pickFiles = require('broccoli-static-compiler');


/*
  This Brocfile specifes the options for the dummy test app of this
  addon, located in `/tests/dummy`

  This Brocfile does *not* influence how the addon or the app using it
  behave. You most likely want to be modifying `./index.js` or app's Brocfile
*/

var app = new EmberAddon();

var es5Shim = pickFiles('node_modules/es5-shim', {
  srcDir: '/',
  files: ['es5-shim.js'],
  destDir: '/assets'
});

module.exports = app.toTree([es5Shim]);
