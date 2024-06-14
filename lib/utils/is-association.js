import isPlainObject from "lodash/isPlainObject.js";

/**
  @hide
*/
export default function (object) {
  return isPlainObject(object) && object.__isAssociation__ === true;
}
