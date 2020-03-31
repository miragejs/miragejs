import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | Named One-Way Reflexive | association #create", () => {
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
      let [child] = helper[state]();

      let ganon = child.createParent({ name: "Ganon" });

      expect(ganon.id).toBeTruthy();
      expect(child.parent.attrs).toEqual(ganon.attrs);
      expect(child.parentId).toEqual(ganon.id);
      expect(helper.schema.users.find(child.id).parentId).toEqual(ganon.id);
    });
  });
});
