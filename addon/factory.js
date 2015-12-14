import _assign from 'lodash/object/assign';
import _isArray from 'lodash/lang/isArray';
import _isFunction from 'lodash/lang/isFunction';
import _isPlainObject from 'lodash/lang/isPlainObject';
import _mapValues from 'lodash/object/mapValues';

var Factory = function() {
  this.build = function(sequence) {
    const topLevelAttrs = this.attrs || {};
    let buildAttrs;
    let buildSingleValue;

    buildAttrs = function(attrs) {
      return _mapValues(attrs, buildSingleValue);
    };

    buildSingleValue = function(value) {
      if (_isArray(value)) {
        return value.map(buildSingleValue);
      } else if (_isPlainObject(value)) {
        return buildAttrs(value);
      } else if (_isFunction(value)) {
        return value.call(topLevelAttrs, sequence);
      } else {
        return value;
      }
    };

    return buildAttrs(topLevelAttrs);
  };
};

Factory.extend = function(attrs) {
  // Merge the new attributes with existing ones. If conflict, new ones win.
  var newAttrs = _assign({}, this.attrs, attrs);

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
