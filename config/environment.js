'use strict';

function usingProxy() {
  return !!process.argv.filter(function (arg) {
    return arg.indexOf('--proxy') === 0;
  }).length;
}

module.exports = function(environment, appConfig) {
  appConfig['ember-cli-mirage'] = appConfig['ember-cli-mirage'] || {};

  appConfig['ember-cli-mirage']['usingProxy'] = usingProxy();

  return {};
};
