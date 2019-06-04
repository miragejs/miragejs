import {
  underscore,
  camelize as _camelize,
  dasherize as _dasherize
} from 'inflected';

/**
 * @param {String} word
 * @hide
 */
export function camelize(word) {
  return _camelize(underscore(word), false);
}

/**
 * @param {String} word
 * @hide
 */
export function dasherize(word) {
  return _dasherize(underscore(word));
}

export { underscore, capitalize } from 'inflected';
