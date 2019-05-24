import {
  camelize,
  pluralize,
  singularize,
  dasherize
} from 'ember-cli-mirage/utils/inflector';

/**
  @hide
*/
export function toCollectionName(type) {
  let modelName = dasherize(type);
  return camelize(pluralize(modelName));
}

/**
  @hide
*/
export function toInternalCollectionName(type) {
  return `_${toCollectionName(type)}`;
}

/**
  @hide
*/
export function toModelName(type) {
  let modelName = dasherize(type);
  return singularize(modelName);
}
