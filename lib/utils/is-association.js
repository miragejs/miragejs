import { isPlainObject } from "lodash-es";

/**
  @hide
*/
export default function(object) {
  return isPlainObject(object) && object.__isAssociation__ === true;
}
