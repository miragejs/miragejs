import Helper from "./_helper";

describe("External | Shared | ORM | Belongs To | One To One | instantiating", () => {
  let helper, schema;

  beforeEach(() => {
    helper = new Helper();
    schema = helper.schema;
  });
  afterEach(() => {
    helper.shutdown();
  });

  test("the child accepts a saved parent id", () => {
    let profile = helper.savedParent();
    let user = schema.users.new({ profileId: profile.id });

    expect(user.profileId).toEqual(profile.id);
    expect(user.profile.attrs).toEqual(profile.attrs);
    expect(user.attrs).toEqual({ profileId: profile.id });
  });

  test("the child errors if the parent id doesnt exist", () => {
    expect(function () {
      schema.users.new({ profileId: 2 });
    }).toThrow();
  });

  test("the child accepts a null parent id", () => {
    let user = schema.users.new({ profileId: null });

    expect(user.profileId).toBeNil();
    expect(user.profile).toBeNil();
    expect(user.attrs).toEqual({ profileId: null });
  });

  test("the child accepts a saved parent model", () => {
    let profile = helper.savedParent();
    let user = schema.users.new({ profile });

    expect(user.profileId).toBe("1");
    expect(user.profile.attrs).toEqual(profile.attrs);
    expect(user.attrs).toEqual({ profileId: null }); // this would update when saved
  });

  test("the child accepts a new parent model", () => {
    let profile = schema.profiles.new({ age: 300 });
    let user = schema.users.new({ profile });

    expect(user.profileId).toBeNil();
    expect(user.profile).toEqual(profile);
    expect(user.attrs).toEqual({ profileId: null });
  });

  test("the child accepts a null parent model", () => {
    let user = schema.users.new({ profile: null });

    expect(user.profileId).toBeNil();
    expect(user.profile).toBeNil();
    expect(user.attrs).toEqual({ profileId: null });
  });

  test("the child accepts a parent model and id", () => {
    let profile = helper.savedParent();
    let user = schema.users.new({ profile, profileId: profile.id });

    expect(user.profileId).toBe("1");
    expect(user.profile).toEqual(profile);
    expect(user.attrs).toEqual({ profileId: profile.id });
  });

  test("the child accepts no reference to a parent id or model as empty obj", () => {
    let user = schema.users.new({});

    expect(user.profileId).toBeNil();
    expect(user.profile).toBeNil();
    expect(user.attrs).toEqual({ profileId: null });
  });

  test("the child accepts no reference to a parent id or model", () => {
    let user = schema.users.new();

    expect(user.profileId).toBeNil();
    expect(user.profile).toBeNil();
    expect(user.attrs).toEqual({ profileId: null });
  });
});
