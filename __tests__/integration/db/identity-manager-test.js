import { module, test } from "qunit";
import {
  Model,
  hasMany,
  belongsTo,
  Server,
  IdentityManager as DefaultIdentityManager
} from "@miragejs/server";

const CustomIdentityManager = class {
  constructor() {
    this.wasCalled = false;
  }
  fetch() {
    if (this.wasCalled) {
      throw new Error(
        "IdentityManager used for test only supports one call to fetch"
      );
    }
    this.wasCalled = true;
    return "custom-id";
  }
  set(id) {
    throw new Error("Not implemented for test.");
  }
  reset() {
    throw new Error("Not implemented for test.");
  }
};

module("Integration | Db | Identity manager", function(hooks) {
  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test("it uses identity managers defined by config", function(assert) {
    this.server = new Server({
      environment: "test",
      identityManagers: {
        post: DefaultIdentityManager,
        author: CustomIdentityManager
      },
      models: {
        author: Model.extend({
          posts: hasMany()
        }),
        comment: Model.extend({
          post: belongsTo()
        }),
        post: Model.extend({
          author: belongsTo()
        })
      }
    });

    let author = server.create("author");
    let comment = server.create("comment");
    let post = server.create("post");
    assert.equal(
      author.id,
      "custom-id",
      "custom identity manager defined in config is used"
    );
    assert.equal(
      post.id,
      "1",
      "ember-cli-mirage identity manager defined in config is used"
    );
    assert.equal(
      comment.id,
      "1",
      "falls back to ember-cli-mirage identity manager if no one is defined in config for model"
    );
  });

  test("attribute hash is passed to identity managers fetch method", function(assert) {
    assert.expect(2);

    let dataForRecord = {
      foo: "bar"
    };
    let IdentityManagerForTest = class {
      fetch(data) {
        assert.ok(data);
        assert.deepEqual(data, dataForRecord);
      }
    };
    this.server = new Server({
      environment: "test",
      identityManagers: {
        application: IdentityManagerForTest
      },
      models: {
        foo: Model.extend()
      }
    });
    this.server.create("foo", dataForRecord);
  });
});
