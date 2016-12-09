import _isPlainObject from 'lodash/lang/isPlainObject';

export default function(object) {
  return _isPlainObject(object) && object.__isAssociation__ === true;
}
