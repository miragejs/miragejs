import _assign from 'lodash/assign';
import _has from 'lodash/has';

/**
  @hide
*/
export default function extend(protoProps, staticProps) {
  let Parent = this;

  class Child extends Parent {
    constructor(...args) {
      super(...args);
      // The constructor function for the new subclass is optionally defined by you
      // in your `extend` definition
      if (protoProps && _has(protoProps, 'constructor')) {
        protoProps.constructor.call(this, ...args);
      }
    }
  }

  // Add static properties to the constructor function, if supplied.

  _assign(Child, Parent, staticProps);

  // Add prototype properties (instance properties) to the subclass,
  // if supplied.
  if (protoProps) {
    _assign(Child.prototype, protoProps);
  }

  return Child;
}
