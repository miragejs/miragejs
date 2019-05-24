import Ember from 'ember';

/* eslint no-console: 0 */
let errorProps = [
  'description',
  'fileName',
  'lineNumber',
  'message',
  'name',
  'number',
  'stack'
];

/**
  @hide
*/
export default function assert(bool, text) {
  if (typeof bool === 'string' && !text) {
    throw new MirageError(bool);
  }

  if (!bool) {
    throw new MirageError(text.replace(/^ +/gm, '') || 'Assertion failed');
  }
}

/**
  @public
  @hide
  Copied from ember-metal/error
*/
export function MirageError(message, stack) {
  let tmp = Error(message);

  if (stack) {
    tmp.stack = stack;
  }

  for (let idx = 0; idx < errorProps.length; idx++) {
    let prop = errorProps[idx];

    if (['description', 'message', 'stack'].indexOf(prop) > -1) {
      this[prop] = `Mirage: ${tmp[prop]}`;
    } else {
      this[prop] = tmp[prop];
    }
  }
}

MirageError.prototype = Object.create(Error.prototype);

/**
  @hide
*/
export const logger = {
  errors: [],

  get messages() {
    return this.errors;
  },

  error(message) {
    if (Ember.testing) {
      this.errors.push(message);
    } else {
      console.error(message);
    }
  }
};
