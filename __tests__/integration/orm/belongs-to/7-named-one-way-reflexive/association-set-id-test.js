import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Named One-Way Reflexive | association #setId', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parentId, for all states
  */
  states.forEach((state) => {

    test(`a ${state} can update its association to a saved parent via parentId`, assert => {
      let [ child ] = this.helper[state]();
      let savedParent = this.helper.savedParent();

      child.parentId = savedParent.id;

      expect(child.parentId).toEqual(savedParent.id);
      expect(child.parent.attrs).toEqual(savedParent.attrs);
    });

  });

  [
    'savedChildSavedParent',
    'newChildSavedParent'
  ].forEach((state) => {

    test(`a ${state} can clear its association via a null parentId`, assert => {
      let [ child ] = this.helper[state]();

      child.parentId = null;

      expect(child.parentId).toEqual(null);
      expect(child.parent).toEqual(null);
    });

  });
});
