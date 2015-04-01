'use strict';
var fs = require('fs');

function isEnabledEnvironment(environment, appConfig) {
  var environments = appConfig['ember-cli-mirage'] && appConfig['ember-cli-mirage'].enabledEnvironments || ['test','development'];
  return environments.indexOf(environment) > -1;
}

function usingProxy() {
  var usingProxyArg = !!process.argv.filter(function (arg) {
    return arg.indexOf('--proxy') === 0;
  }).length;

  var hasGeneratedProxies = false;
  var proxiesDir = process.env.PWD + '/server/proxies';
  try {
    fs.lstatSync(proxiesDir);
    hasGeneratedProxies = true;
  } catch (e) {}

  return usingProxyArg || hasGeneratedProxies;
}

module.exports = function(environment, appConfig) {
  appConfig['ember-cli-mirage'] = appConfig['ember-cli-mirage'] || {};

  appConfig['ember-cli-mirage']['usingProxy'] = usingProxy();

  appConfig['ember-cli-mirage']['isEnabledEnvironment'] = isEnabledEnvironment(environment, appConfig);
  return {};
};
