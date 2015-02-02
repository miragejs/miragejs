'use strict';

function usingProxy() {
  return !!process.argv.filter(function (arg) {
    return arg.indexOf('--proxy') === 0;
  }).length;
}

module.exports = function(environment, appConfig) {
  appConfig['ember-pretenderify'] = appConfig['ember-pretenderify'] || {};
  var setupPretender = ((environment === 'development' && !usingProxy()));

  appConfig['ember-pretenderify']['setupPretender'] = setupPretender;

  return { };
};
