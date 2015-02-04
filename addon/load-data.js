/* global Ember, requirejs, require */
/*jslint node: true */

"use strict";

export default function(prefix, store) {
  var pretenderDatafileRegExp = new RegExp('^' + prefix + '/pretender/data');

  Ember.keys(requirejs._eak_seen).filter(function(key) {
    return pretenderDatafileRegExp.test(key);
  }).forEach(function(moduleName) {
    var module = require(moduleName, null, null, true);
    if (!module) { throw new Error(moduleName + ' must export some data.'); }

    var data = module['default'];
    var key = moduleName.match(/[^\/]+\/?$/)[0];

    store.loadData(data, key);
  });
}
