import { Server, Model, Factory, hasMany, belongsTo } from "miragejs";
import { inflections, pluralize, singularize } from "inflected";

// eslint-disable-next-line no-console
let originalWarn = console.warn;

function expectNoWarning() {
  // eslint-disable-next-line no-console
  console.warn = () => {
    expect(true).toBeFalsy();
  };
}

describe("External | Shared | Factories | create and createList", function () {
  let server, Contact, AmazingContact, Post, Author, Data;

  beforeEach(function () {
    inflections("en", (inflect) => {
      inflect.uncountable("data");
    });

    Contact = Model.extend();
    AmazingContact = Model.extend();
    Post = Model.extend({
      author: belongsTo(),
    });
    Author = Model.extend({
      posts: hasMany(),
    });
    Data = Model.extend();

    server = new Server({
      environment: "test",
      inflector: { pluralize, singularize },
      models: {
        contact: Contact,
        amazingContact: AmazingContact,
        post: Post,
        author: Author,
        data: Data,
      },
      factories: {
        contact: Factory.extend({
          name: "Yehuda",
        }),
        amazingContact: Factory,
      },
    });
  });

  afterEach(function () {
    server.shutdown();

    // eslint-disable-next-line no-console
    console.warn = originalWarn;
  });

  test("create throws when passing in an undefined model", () => {
    expectNoWarning();

    expect(() => {
      server.create("foo");
    }).toThrow(
      `You called server.create('foo') but no model or factory was found.`
    );
  });

  // This used to be deprecated behavior, but now it errors. So we test it separately from the nonsense test above.
  test("create throws when passing in a pluralized version of a model", () => {
    expect.assertions(1);

    expect(() => {
      server.create("contacts");
    }).toThrow(
      `You called server.create('contacts') but no model or factory was found. Make sure you're passing in the singularized version of the model or factory name`
    );
  });

  test("create returns a Model if one is defined", () => {
    expectNoWarning();

    let contact = server.create("contact");

    expect(contact instanceof Contact).toBeTruthy();
    expect(contact.name).toBe("Yehuda");
  });

  test("create returns a Model instance if the Model name is uncountable", () => {
    expectNoWarning();

    let data = server.create("data");

    expect(data instanceof Data).toBeTruthy();
  });

  test("createList throws when passing in an undefined model", () => {
    expectNoWarning();

    expect(() => {
      server.createList("foo", 1);
    }).toThrow(
      `You called server.createList('foo') but no model or factory was found.`
    );
  });

  // This used to be deprecated behavior, but now it errors. So we test it separately from the nonsense test above.
  test("createList throws when passing in a pluralized version of a model", () => {
    expect.assertions(1);

    expect(() => {
      server.createList("contacts", 1);
    }).toThrow(
      `You called server.createList('contacts') but no model or factory was found. Make sure you're passing in the singularized version of the model or factory name.`
    );
  });

  test("createList returns Models if one is defined", () => {
    expectNoWarning();

    let contacts = server.createList("contact", 1);

    expect(contacts[0] instanceof Contact).toBeTruthy();
    expect(contacts[0].name).toBe("Yehuda");
  });

  test("createList returns Models if the model name is uncountable", () => {
    expectNoWarning();

    let data = server.createList("data", 1);

    expect(data[0] instanceof Data).toBeTruthy();
  });

  test("create returns a Model if one is defined, when using a compound name", () => {
    expectNoWarning();

    let contact = server.create("amazing-contact");

    expect(contact instanceof AmazingContact).toBeTruthy();
  });

  test("createList returns Models if one is defined, when using a compound name", () => {
    expectNoWarning();

    let contacts = server.createList("amazing-contact", 1);

    expect(contacts[0] instanceof AmazingContact).toBeTruthy();
  });

  test("create falls back to a model if no factory is defined", () => {
    expectNoWarning();

    let post = server.create("post");

    expect(post instanceof Post).toBeTruthy();
    expect(post.id).toBe("1");
  });

  test("createList falls back to a model if no factory is defined", () => {
    expectNoWarning();

    let posts = server.createList("post", 2);

    expect(posts[0] instanceof Post).toBeTruthy();
    expect(posts).toHaveLength(2);
    expect(posts[0].id).toBe("1");
  });

  test("create sets up the db correctly when passing in fks", () => {
    expectNoWarning();

    let author = server.create("author");
    let post = server.create("post", {
      authorId: author.id,
    });
    author.reload();

    expect(author.posts.models).toHaveLength(1);
    expect(post.author.attrs).toEqual(author.attrs);
    expect(server.db.posts[0].authorId).toEqual(author.id);
  });

  test("create sets up the db correctly when passing in models", () => {
    expectNoWarning();

    let author = server.create("author");
    let post = server.create("post", {
      author,
    });

    expect(author.posts.models).toHaveLength(1);
    expect(post.author.attrs).toEqual(author.attrs);
    expect(server.db.posts[0].authorId).toEqual(author.id);
  });
});
