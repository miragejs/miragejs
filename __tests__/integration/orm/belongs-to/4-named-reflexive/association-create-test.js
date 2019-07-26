import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | Named Reflexive | association #create", () => {
  beforeEach(() =>  {
    this.helper = new Helper();
  });

  /*
    The model can create a belongs-to association, for all states
  */
  states.forEach(state => {
    test(`a ${state} can create an associated parent`, () => {
      let [user] = this.helper[state]();

      let ganon = user.createBestFriend({ name: "Ganon" });

      expect(ganon.id).toBeTruthy();
      expect(user.bestFriend.attrs).toEqual(ganon.attrs);
      expect(user.bestFriendId).toEqual(ganon.id);
      expect(this.helper.schema.users.find(user.id).bestFriendId).toEqual(
        ganon.id
      );
    });
  });
});
