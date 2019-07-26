import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | Named one-way reflexive self referential | association #set", () => {
  beforeEach(() =>  {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to itself`, () => {
      let [user] = this.helper[state]();

      user.representative = user;

      expect(user.representativeId).toEqual(user.id);
      expect(user.representative.attrs).toEqual(user.attrs);

      user.save();

      expect(user.representativeId).toEqual(user.id);
      expect(user.representative.attrs).toEqual(user.attrs);
    });

    test(`a ${state} can update its association to a null parent`, () => {
      let [user] = this.helper[state]();

      user.representative = null;

      expect(user.representativeId).toEqual(null);
      expect(user.representative).toEqual(null);

      user.save();

      expect(user.representativeId).toEqual(null);
      expect(user.representative).toEqual(null);
    });
  });
});
