import {
  dasherize
} from '../utils/inflector';

/**
  @hide
*/
export function toModelName(type) {
  let modelName = dasherize(type);
  return singularize(modelName);
}
