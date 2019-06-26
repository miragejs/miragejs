import {
  underscore,
  camelize as _camelize,
  dasherize as _dasherize
} from "inflected";
import { lowerFirst } from "lodash-es";

/**
 * @param {String} word
 * @hide
 */
export function camelize(word) {
  let camelizedWord = _camelize(underscore(word), false);

  /*
   The `ember-inflector` package's version of camelize lower-cases the first
   word after a slash, e.g.

       camelize('my-things/nice-watch'); // 'myThings/niceWatch'

   The `inflected` package doesn't, so we make that change here to not break
   existing functionality. (This affects the name of the schema collections.)
  */
  return camelizedWord
    .split("/")
    .map(lowerFirst)
    .join("/");
}

/**
 * @param {String} word
 * @hide
 */
export function dasherize(word) {
  return _dasherize(underscore(word));
}

export { underscore, capitalize } from "inflected";
