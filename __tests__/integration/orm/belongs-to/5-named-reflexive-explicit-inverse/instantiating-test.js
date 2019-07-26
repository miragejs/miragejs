import Helper from "./_helper";

describe("Integration | ORM | Belongs To | Named Reflexive Explicit Inverse | instantiating", () => {
  beforeEach(() =>  {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  });

  test("the child accepts a saved parent id", () => {
    let friend = this.helper.savedParent();
    let user = this.schema.users.new({ bestFriendId: friend.id });

    expect(user.bestFriendId).toEqual(friend.id);
    expect(user.bestFriend.attrs).toEqual(friend.attrs);
    expect(user.attrs).toEqual({ bestFriendId: friend.id });
  });

  test("the child errors if the parent id doesnt exist", () => {
    expect(function() {
      this.schema.users.new({ bestFriendId: 2 });
    }).toThrow();
  });

  test("the child accepts a null parent id", () => {
    let user = this.schema.users.new({ bestFriendId: null });

    expect(user.bestFriendId).toEqual(null);
    expect(user.bestFriend).toEqual(null);
    expect(user.attrs).toEqual({ bestFriendId: null });
  });

  test("the child accepts a saved parent model", () => {
    let friend = this.helper.savedParent();
    let user = this.schema.users.new({ bestFriend: friend });

    expect(user.bestFriendId).toEqual(1);
    expect(user.bestFriend.attrs).toEqual(friend.attrs);
    expect(user.attrs).toEqual({ bestFriendId: null }); // this would update when saved
  });

  test("the child accepts a new parent model", () => {
    let zelda = this.schema.users.new({ name: "Zelda" });
    let user = this.schema.users.new({ bestFriend: zelda });

    expect(user.bestFriendId).toEqual(null);
    expect(user.bestFriend).toEqual(zelda);
    expect(user.attrs).toEqual({ bestFriendId: null });
  });

  test("the child accepts a null parent model", () => {
    let user = this.schema.users.new({ bestFriend: null });

    expect(user.bestFriendId).toEqual(null);
    expect(user.bestFriend).toEqual(null);
    expect(user.attrs).toEqual({ bestFriendId: null });
  });

  test("the child accepts a parent model and id", () => {
    let friend = this.helper.savedParent();
    let user = this.schema.users.new({
      bestFriend: friend,
      bestFriendId: friend.id
    });

    expect(user.bestFriendId).toEqual("1");
    expect(user.bestFriend).toEqual(friend);
    expect(user.attrs).toEqual({ bestFriendId: friend.id });
  });

  test("the child accepts no reference to a parent id or model as empty obj", () => {
    let user = this.schema.users.new({});

    expect(user.bestFriendId).toEqual(null);
    expect(user.bestFriend).toEqual(null);
    expect(user.attrs).toEqual({ bestFriendId: null });
  });

  test("the child accepts no reference to a parent id or model", () => {
    let user = this.schema.users.new();

    expect(user.bestFriendId).toEqual(null);
    expect(user.bestFriend).toEqual(null);
    expect(user.attrs).toEqual({ bestFriendId: null });
  });
});
