/* global requirejs */

import _find from 'lodash/find';

function _hasEmberData() {
  let matchRegex = /^ember-data/i;
  return !!_find(Object.keys(requirejs.entries), (e) => !!e.match(matchRegex));
}

/**
  @hide
*/
export const hasEmberData = _hasEmberData();

/**
  @hide
*/
export function isDsModel(m) {
  return m && typeof m.eachRelationship === 'function';
}
