import Helper from "./_helper";

describe("External | Shared | ORM | Belongs To | Named Reflexive | instantiating", () => {
  let helper, schema;

  beforeEach(() => {
    helper = new Helper();
    schema = helper.schema;
  });
  afterEach(() => {
    helper.shutdown();
  });

  test("the child accepts a saved parent id", () => {
    let friend = helper.savedParent();
    let user = schema.users.new({ bestFriendId: friend.id });

    expect(user.bestFriendId).toEqual(friend.id);
    expect(user.bestFriend.attrs).toEqual(friend.attrs);
    expect(user.attrs).toEqual({ bestFriendId: friend.id });
  });

  test("the child errors if the parent id doesnt exist", () => {
    expect(function () {
      schema.users.new({ bestFriendId: 2 });
    }).toThrow();
  });

  test("the child accepts a null parent id", () => {
    let user = schema.users.new({ bestFriendId: null });

    expect(user.bestFriendId).toBeNil();
    expect(user.bestFriend).toBeNil();
    expect(user.attrs).toEqual({ bestFriendId: null });
  });

  test("the child accepts a saved parent model", () => {
    let friend = helper.savedParent();
    let user = schema.users.new({ bestFriend: friend });

    expect(user.bestFriendId).toBe("1");
    expect(user.bestFriend.attrs).toEqual(friend.attrs);
    expect(user.attrs).toEqual({ bestFriendId: null }); // this would update when saved
  });

  test("the child accepts a new parent model", () => {
    let zelda = schema.users.new({ name: "Zelda" });
    let user = schema.users.new({ bestFriend: zelda });

    expect(user.bestFriendId).toBeNil();
    expect(user.bestFriend).toEqual(zelda);
    expect(user.attrs).toEqual({ bestFriendId: null });
  });

  test("the child accepts a null parent model", () => {
    let user = schema.users.new({ bestFriend: null });

    expect(user.bestFriendId).toBeNil();
    expect(user.bestFriend).toBeNil();
    expect(user.attrs).toEqual({ bestFriendId: null });
  });

  test("the child accepts a parent model and id", () => {
    let friend = helper.savedParent();
    let user = schema.users.new({
      bestFriend: friend,
      bestFriendId: friend.id,
    });

    expect(user.bestFriendId).toBe("1");
    expect(user.bestFriend).toEqual(friend);
    expect(user.attrs).toEqual({ bestFriendId: friend.id });
  });

  test("the child accepts no reference to a parent id or model as empty obj", () => {
    let user = schema.users.new({});

    expect(user.bestFriendId).toBeNil();
    expect(user.bestFriend).toBeNil();
    expect(user.attrs).toEqual({ bestFriendId: null });
  });

  test("the child accepts no reference to a parent id or model", () => {
    let user = schema.users.new();

    expect(user.bestFriendId).toBeNil();
    expect(user.bestFriend).toBeNil();
    expect(user.attrs).toEqual({ bestFriendId: null });
  });
});
