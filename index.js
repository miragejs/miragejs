/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-pretenderify',
  included: function(app) {
    this._super.included(app);

    // Shim Pretender in production
    if (app.env === 'production') {
      app.import('vendor/production-pretender/shim.js', {
        type: 'vendor',
        exports: { 'pretender': ['default'] }
      });
    }
  }
};
