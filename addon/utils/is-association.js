import _isPlainObject from 'lodash/isPlainObject';

/**
  @hide
*/
export default function(object) {
  return _isPlainObject(object) && object.__isAssociation__ === true;
}
