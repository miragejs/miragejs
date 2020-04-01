import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | Named one-way reflexive self referential | association #create", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The model can create a belongs-to association, for all states
  */
  states.forEach((state) => {
    test(`a ${state} can create an associated parent`, () => {
      let [user] = helper[state]();

      let ganon = user.createRepresentative({ name: "Ganon" });

      expect(ganon.id).toBeTruthy();
      expect(user.representative.attrs).toEqual(ganon.attrs);
      expect(user.representativeId).toEqual(ganon.id);
      expect(helper.schema.users.find(user.id).representativeId).toEqual(
        ganon.id
      );
    });
  });
});
