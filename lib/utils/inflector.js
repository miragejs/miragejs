import {
  underscore,
  camelize as _camelize,
  dasherize as _dasherize,
  inflections
} from 'inflected';
import Inflector from 'inflected/src/Inflector';

export function configureInflector(configuratorFn) {
  inflections(configuratorFn);
}

export function clearInflector() {
  Inflector.getInstance().clear();
}

export function camelize(word) {
  return _camelize(underscore(word), false);
}

export function dasherize(word) {
  return _dasherize(underscore(word));
}

export { underscore };
export { singularize, pluralize, capitalize } from 'inflected';
