'use strict';

function usingProxy() {
  return !!process.argv.filter(function (arg) {
    return arg.indexOf('--proxy') === 0;
  }).length;
}

module.exports = function(environment, appConfig) {
  var usePretender = (environment !== 'production' && !usingProxy());

  appConfig['ember-pretenderify'] = {
    usePretender: usePretender
  };

  return { };
};
