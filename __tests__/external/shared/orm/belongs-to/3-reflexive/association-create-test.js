import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | Reflexive | association #create", () => {
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
      let [user, originalUser] = helper[state]();

      let ganon = user.createUser({ name: "Ganon" });

      expect(ganon.id).toBeTruthy();
      expect(user.user.attrs).toEqual(ganon.attrs);
      expect(ganon.user.attrs).toEqual(user.attrs);
      expect(user.userId).toEqual(ganon.id);
      expect(ganon.userId).toEqual(user.id);
      expect(helper.schema.users.find(user.id).userId).toEqual(ganon.id);

      if (originalUser) {
        originalUser.reload();
        expect(originalUser.userId).toBeNil();
      }
    });
  });
});
