import Helper, { states } from "./_helper";

describe("Integration | ORM | Mixed | One To Many Polymorphic | association #create", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can create a has-many association, for all states
  */
  states.forEach(state => {
    test(`a ${state} can create an associated parent`, () => {
      let [user] = this.helper[state]();
      let initialCount = user.things.models.length;

      let post = user.createThing("post", { title: "Lorem ipsum" });

      expect(post.id).toBeTruthy();
      expect(user.things.models.length).toEqual(initialCount + 1);
      expect(user.things.includes(post)).toBeTruthy();
      expect(
        user.thingIds.find(obj => {
          return obj.id === post.id && obj.type === "post";
        })
      ).toBeTruthy();
      expect(
        user.attrs.thingIds.find(obj => {
          return obj.id === post.id && obj.type === "post";
        })
      ).toBeTruthy();

      // Check the inverse
      expect(post.user.attrs).toEqual(user.attrs);
      expect(post.userId).toEqual(user.id);
    });
  });
});
