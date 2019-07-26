import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | Named One-Way Reflexive | association #setIds", () => {
  beforeEach(() =>  {
    this.helper = new Helper();
  });

  states.forEach(state => {
    test(`a ${state} can update its association to include a saved child via childIds`, () => {
      let [tag] = this.helper[state]();
      let savedTag = this.helper.savedChild();

      tag.labelIds = [savedTag.id];

      expect(tag.labels.models[0].attrs).toEqual(savedTag.attrs);
      expect(tag.labelIds).toEqual([savedTag.id]);

      tag.save();
      savedTag.reload();

      expect(savedTag.labels.models.length).toEqual(0);
    });

    test(`a ${state} can clear its association via a null childIds`, () => {
      let [tag] = this.helper[state]();

      tag.labelIds = null;

      expect(tag.labels.models).toEqual([]);
      expect(tag.labelIds).toEqual([]);

      tag.save();
    });
  });
});
