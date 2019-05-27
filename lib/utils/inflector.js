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
// Exposing inflections so `ember-cli-mirage` can customise inflector
// Still has a lot to improve
export { singularize, pluralize, capitalize, inflections as __inflections } from 'inflected';
