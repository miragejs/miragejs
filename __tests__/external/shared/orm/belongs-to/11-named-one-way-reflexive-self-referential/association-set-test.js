import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | Named one-way reflexive self referential | association #set", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach((state) => {
    test(`a ${state} can update its association to itself`, () => {
      let [user] = helper[state]();

      user.representative = user;

      expect(user.representativeId).toEqual(user.id);
      expect(user.representative.attrs).toEqual(user.attrs);

      user.save();

      expect(user.representativeId).toEqual(user.id);
      expect(user.representative.attrs).toEqual(user.attrs);
    });

    test(`a ${state} can update its association to a null parent`, () => {
      let [user] = helper[state]();

      user.representative = null;

      expect(user.representativeId).toBeNil();
      expect(user.representative).toBeNil();

      user.save();

      expect(user.representativeId).toBeNil();
      expect(user.representative).toBeNil();
    });
  });
});
