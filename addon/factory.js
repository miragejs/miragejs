import Ember from 'ember';
/* global jQuery */

var Factory = function() {
  this.build = function(sequence) {
    var object = {};
    var attrs = this.attrs || {};

    Ember.keys(attrs).forEach(function(key) {
      var type = typeof attrs[key];

      if (type === 'string' || type === 'number') {
        object[key] = attrs[key];
      } else if (type === 'function') {
        object[key] = attrs[key].call(attrs, sequence);
      }
    });

    return object;
  };
};

Factory.extend = function(attrs) {
  // Merge the new attributes with existing ones
  var newAttrs = jQuery.extend(true, attrs, this.attrs);

  var Subclass = function() {
    this.attrs = newAttrs;
    Factory.call(this);
  };

  // Copy extend
  Subclass.extend = Factory.extend;

  // Store a reference on the class for future subclasses
  Subclass.attrs = newAttrs;

  return Subclass;
};

export default Factory;
