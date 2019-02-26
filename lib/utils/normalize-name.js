import {
  camelize,
  pluralize,
  singularize,
  dasherize
} from '@miragejs/server/lib/utils/inflector';

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
