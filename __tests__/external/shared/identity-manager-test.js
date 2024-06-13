import {
  Model,
  hasMany,
  belongsTo,
  Server,
  IdentityManager as DefaultIdentityManager,
} from "miragejs";

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

describe("External | Shared | Identity manager", function () {
  let server;

  afterEach(() => {
    server.shutdown();
  });

  test("it uses identity managers defined by config", () => {
    server = new Server({
      environment: "test",
      identityManagers: {
        post: DefaultIdentityManager,
        author: CustomIdentityManager,
      },
      models: {
        author: Model.extend({
          posts: hasMany(),
        }),
        comment: Model.extend({
          post: belongsTo(),
        }),
        post: Model.extend({
          author: belongsTo(),
        }),
      },
    });

    let author = server.create("author");
    let comment = server.create("comment");
    let post = server.create("post");

    expect(author.id).toBe("custom-id");
    expect(post.id).toBe("1");
    expect(comment.id).toBe("1");
  });

  test("identity managers can use record data in their fetch method", () => {
    let IdentityManagerForTest = class {
      fetch(data) {
        return `${data.ssn}`;
      }
    };

    server = new Server({
      environment: "test",
      identityManagers: {
        application: IdentityManagerForTest,
      },
      models: {
        user: Model.extend(),
      },
    });

    let ryan = server.create("user", { name: "Ryan", ssn: 123456789 });

    expect(ryan.id).toBe("123456789");
  });
});
