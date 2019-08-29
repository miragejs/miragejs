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

describe("Integration | Db | Identity manager", function() {
  let server;

  afterEach(() => {
    server.shutdown();
  });

  test("it uses identity managers defined by config", () => {
    server = new Server({
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

    expect(author.id).toEqual("custom-id");
    expect(post.id).toEqual("1");
    expect(comment.id).toEqual("1");
  });

  test("attribute hash is passed to identity managers fetch method", () => {
    expect.assertions(2);

    let dataForRecord = {
      foo: "bar"
    };
    let IdentityManagerForTest = class {
      fetch(data) {
        expect(data).toBeTruthy();
        expect(data).toEqual(dataForRecord);
      }
    };
    server = new Server({
      environment: "test",
      identityManagers: {
        application: IdentityManagerForTest
      },
      models: {
        foo: Model.extend()
      }
    });

    server.create("foo", dataForRecord);
  });
});
