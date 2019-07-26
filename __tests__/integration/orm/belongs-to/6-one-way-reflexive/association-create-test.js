import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | One-Way Reflexive | association #create", () => {
  let helper; beforeEach(() => {
    helper = new Helper();
  });

  /*
    The model can create a belongs-to association, for all states
  */
  states.forEach(state => {
    test(`a ${state} can create an associated parent`, () => {
      let [child] = helper[state]();

      let ganon = child.createUser({ name: "Ganon" });

      expect(ganon.id).toBeTruthy();
      expect(child.user.attrs).toEqual(ganon.attrs);
      expect(child.userId).toEqual(ganon.id);
      expect(helper.schema.users.find(child.id).userId).toEqual(ganon.id);
    });
  });
});
