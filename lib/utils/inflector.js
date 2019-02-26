import {
  underscore,
  camelize as _camelize,
  dasherize as _dasherize
} from 'inflected';

export function camelize(word) {
  return _camelize(underscore(word), false);
}

export function dasherize(word) {
  return _dasherize(underscore(word));
}

export { underscore };
export { singularize, pluralize, capitalize } from 'inflected';
