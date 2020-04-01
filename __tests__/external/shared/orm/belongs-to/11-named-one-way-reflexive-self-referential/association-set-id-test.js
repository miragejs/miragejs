import Helper from "./_helper";

describe("External | Shared | ORM | Belongs To | Named one-way reflexive self referential | association #setId", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The model can update its association via parentId, for all states
  */

  ["savedChildNoParent", "savedChildSavedParent"].forEach((state) => {
    test(`a ${state} can update its association to itself via parentId`, () => {
      let [user] = helper[state]();

      user.representativeId = user.id;

      expect(user.representativeId).toEqual(user.id);
      expect(user.representative.attrs).toEqual(user.attrs);

      user.save();

      expect(user.representativeId).toEqual(user.id);
      expect(user.representative.attrs).toEqual(user.attrs);
    });
  });

  ["savedChildSavedParent", "newChildNewParent"].forEach((state) => {
    test(`a ${state} can clear its association via a null parentId`, () => {
      let [user] = helper[state]();

      user.representativeId = null;

      expect(user.representativeId).toBeNil();
      expect(user.representative).toBeNil();

      user.save();

      expect(user.representativeId).toBeNil();
      expect(user.representative).toBeNil();
    });
  });
});
