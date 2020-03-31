import isPlainObject from "lodash.isplainobject";

/**
  @hide
*/
export default function (object) {
  return isPlainObject(object) && object.__isAssociation__ === true;
}
