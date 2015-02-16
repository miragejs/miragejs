/* global Ember, requirejs, require */
/*jslint node: true */

"use strict";

/*
  This function looks through all files that have been loaded by Ember CLI and
  finds the ones under /pretender/data, and exports a hash containing the names
  of the files as keys and the data as values.
*/
export default function(prefix) {
  var pretenderDatafileRegExp = new RegExp('^' + prefix + '/pretender/data');
  var dataFromFiles = {};

  Ember.keys(requirejs._eak_seen).filter(function(key) {
    return pretenderDatafileRegExp.test(key);
  }).forEach(function(moduleName) {
    var module = require(moduleName, null, null, true);
    if (!module) { throw new Error(moduleName + ' must export some data.'); }

    var data = module['default'];
    var key = moduleName.match(/[^\/]+\/?$/)[0];

    dataFromFiles[key] = data;
  });

  return dataFromFiles;
}
