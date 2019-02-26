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
export function MirageError() {
  let tmp = Error.apply(this, arguments);

  for (let idx = 0; idx < errorProps.length; idx++) {
    let prop = errorProps[idx];

    if (['description', 'message', 'stack'].indexOf(prop) > -1) {
      this[prop] = `Mirage: ${tmp[prop]}`;
    } else {
      this[prop] = tmp[prop];
    }
  }

  console.error(this.message);
  console.error(this);
}

MirageError.prototype = Object.create(Error.prototype);
