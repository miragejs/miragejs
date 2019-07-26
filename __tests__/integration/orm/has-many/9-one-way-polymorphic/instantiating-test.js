import Helper from "./_helper";
import { module, test } from "qunit";

describe("Integration | ORM | Has Many | One-way Polymorphic | instantiating", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  });

  test("the parent accepts a saved child id", assert => {
    let post = this.helper.savedChild();
    let user = this.schema.users.new({
      thingIds: [{ type: "post", id: post.id }]
    });

    expect(user.thingIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.things.includes(post)).toBeTruthy();
  });

  test("the parent errors if the children ids don't exist", assert => {
    expect(function() {
      this.schema.users.new({ thingIds: [{ type: "post", id: 2 }] });
    }).toThrow();
  });

  test("the parent accepts null children foreign key", assert => {
    let user = this.schema.users.new({ thingIds: null });

    expect(user.things.models.length).toEqual(0);
    expect(user.thingIds).toEqual([]);
    expect(user.attrs).toEqual({ thingIds: null });
  });

  test("the parent accepts saved children", assert => {
    let post = this.helper.savedChild();
    let user = this.schema.users.new({ things: [post] });

    expect(user.thingIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.things.includes(post)).toBeTruthy();
  });

  test("the parent accepts new children", assert => {
    let post = this.schema.posts.new({ title: "Lorem" });
    let user = this.schema.users.new({ things: [post] });

    expect(user.thingIds).toEqual([{ type: "post", id: undefined }]);
    expect(user.things.includes(post)).toBeTruthy();
  });

  test("the parent accepts null children", assert => {
    let user = this.schema.users.new({ things: null });

    expect(user.things.models.length).toEqual(0);
    expect(user.thingIds).toEqual([]);
    expect(user.attrs).toEqual({ thingIds: null });
  });

  test("the parent accepts children and child ids", assert => {
    let post = this.helper.savedChild();
    let user = this.schema.users.new({
      things: [post],
      thingIds: [{ type: "post", id: post.id }]
    });

    expect(user.thingIds).toEqual([{ type: "post", id: post.id }]);
    expect(user.things.includes(post)).toBeTruthy();
  });

  test("the parent accepts no reference to children or child ids as empty obj", assert => {
    let user = this.schema.users.new({});

    expect(user.thingIds).toEqual([]);
    expect(user.things.models).toEqual([]);
    expect(user.attrs).toEqual({ thingIds: null });
  });

  test("the parent accepts no reference to children or child ids", assert => {
    let user = this.schema.users.new();

    expect(user.thingIds).toEqual([]);
    expect(user.things.models).toEqual([]);
    expect(user.attrs).toEqual({ thingIds: null });
  });
});
