var errorProps = [
  'description',
  'fileName',
  'lineNumber',
  'message',
  'name',
  'number',
  'stack'
];

/**
  Copied from ember-metal/error
*/
export default function MirageError() {
  var tmp = Error.apply(this, arguments);

  for (var idx = 0; idx < errorProps.length; idx++) {
    let prop = errorProps[idx];

    if (['description', 'message', 'stack'].indexOf(prop) > -1) {
      this[prop] = `Mirage: ${tmp[prop]}`;
    } else {
      this[prop] = tmp[prop];
    }
  }
}

MirageError.prototype = Object.create(Error.prototype);
