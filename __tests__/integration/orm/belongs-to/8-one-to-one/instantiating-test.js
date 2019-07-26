import Helper from "./_helper";

describe("Integration | ORM | Belongs To | One To One | instantiating", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  });

  test("the child accepts a saved parent id", assert => {
    let profile = this.helper.savedParent();
    let user = this.schema.users.new({ profileId: profile.id });

    expect(user.profileId).toEqual(profile.id);
    expect(user.profile.attrs).toEqual(profile.attrs);
    expect(user.attrs).toEqual({ profileId: profile.id });
  });

  test("the child errors if the parent id doesnt exist", assert => {
    expect(function() {
      this.schema.users.new({ profileId: 2 });
    }).toThrow();
  });

  test("the child accepts a null parent id", assert => {
    let user = this.schema.users.new({ profileId: null });

    expect(user.profileId).toEqual(null);
    expect(user.profile).toEqual(null);
    expect(user.attrs).toEqual({ profileId: null });
  });

  test("the child accepts a saved parent model", assert => {
    let profile = this.helper.savedParent();
    let user = this.schema.users.new({ profile });

    expect(user.profileId).toEqual(1);
    expect(user.profile.attrs).toEqual(profile.attrs);
    expect(user.attrs).toEqual({ profileId: null }); // this would update when saved
  });

  test("the child accepts a new parent model", assert => {
    let profile = this.schema.profiles.new({ age: 300 });
    let user = this.schema.users.new({ profile });

    expect(user.profileId).toEqual(null);
    expect(user.profile).toEqual(profile);
    expect(user.attrs).toEqual({ profileId: null });
  });

  test("the child accepts a null parent model", assert => {
    let user = this.schema.users.new({ profile: null });

    expect(user.profileId).toEqual(null);
    expect(user.profile).toEqual(null);
    expect(user.attrs).toEqual({ profileId: null });
  });

  test("the child accepts a parent model and id", assert => {
    let profile = this.helper.savedParent();
    let user = this.schema.users.new({ profile, profileId: profile.id });

    expect(user.profileId).toEqual("1");
    expect(user.profile).toEqual(profile);
    expect(user.attrs).toEqual({ profileId: profile.id });
  });

  test("the child accepts no reference to a parent id or model as empty obj", assert => {
    let user = this.schema.users.new({});

    expect(user.profileId).toEqual(null);
    expect(user.profile).toEqual(null);
    expect(user.attrs).toEqual({ profileId: null });
  });

  test("the child accepts no reference to a parent id or model", assert => {
    let user = this.schema.users.new();

    expect(user.profileId).toEqual(null);
    expect(user.profile).toEqual(null);
    expect(user.attrs).toEqual({ profileId: null });
  });
});
