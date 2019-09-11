import {
  underscore as _underscore,
  capitalize as _capitalize,
  camelize as _camelize,
  dasherize as _dasherize
} from "inflected";
import lowerFirst from "lodash.lowerfirst";

const camelizeCache = {};
const dasherizeCache = {};
const underscoreCache = {};
const capitalizeCache = {};

/**
 * @param {String} word
 * @hide
 */
export function camelize(word) {
  if (typeof camelizeCache[word] === "string") return camelizeCache[word];

  let camelizedWord = _camelize(underscore(word), false);

  /*
   The `ember-inflector` package's version of camelize lower-cases the first
   word after a slash, e.g.

       camelize('my-things/nice-watch'); // 'myThings/niceWatch'

   The `inflected` package doesn't, so we make that change here to not break
   existing functionality. (This affects the name of the schema collections.)
  */
  const camelized = camelizedWord
    .split("/")
    .map(lowerFirst)
    .join("/");

  camelizeCache[word] = camelized;
  return camelized;
}

/**
 * @param {String} word
 * @hide
 */
export function dasherize(word) {
  if (typeof dasherizeCache[word] === "string") return dasherizeCache[word];

  const dasherized = _dasherize(underscore(word));

  dasherizeCache[word] = dasherized;
  return dasherized;
}

export function underscore(word) {
  if (typeof underscoreCache[word] === "string") return underscoreCache[word];

  const underscored = _underscore(word);

  underscoreCache[word] = underscored;
  return underscored;
}

export function capitalize(word) {
  if (typeof capitalizeCache[word] === "string") return capitalizeCache[word];

  const capitalized = _capitalize(word);

  capitalizeCache[word] = capitalized;
  return capitalized;
}
