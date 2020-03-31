import { Server, Model } from "miragejs";

describe("External | Shared | ORM | #update", () => {
  let server;

  beforeEach(() => {
    server = new Server({
      environment: "test",
      models: {
        user: Model,
      },
    });

    server.db.loadData({
      users: [
        { id: 1, name: "Link", location: "Hyrule", evil: false },
        { id: 2, name: "Zelda", location: "Hyrule", evil: false },
      ],
    });
  });

  afterEach(() => {
    server.shutdown();
  });

  test("a collection can update its models with a key and value", () => {
    let collection = server.schema.users.all();
    collection.update("evil", true);

    expect(server.db.users).toIncludeSameMembers([
      { id: "1", name: "Link", location: "Hyrule", evil: true },
      { id: "2", name: "Zelda", location: "Hyrule", evil: true },
    ]);
    expect(collection.models[0].attrs).toEqual({
      id: "1",
      name: "Link",
      location: "Hyrule",
      evil: true,
    });
  });

  test("it can update its models with a hash of attrs", () => {
    let collection = server.schema.users.all();
    collection.update({ location: "The water temple", evil: true });

    expect(server.db.users).toIncludeSameMembers([
      { id: "1", name: "Link", location: "The water temple", evil: true },
      { id: "2", name: "Zelda", location: "The water temple", evil: true },
    ]);
    expect(collection.models[0].attrs).toEqual({
      id: "1",
      name: "Link",
      location: "The water temple",
      evil: true,
    });
    expect(collection.models[1].attrs).toEqual({
      id: "2",
      name: "Zelda",
      location: "The water temple",
      evil: true,
    });
  });

  test("it can set an attribute and then save the model", () => {
    let user = server.schema.users.find(1);

    user.name = "Young link";

    expect(user.attrs).toEqual({
      id: "1",
      name: "Young link",
      location: "Hyrule",
      evil: false,
    });
    expect(server.db.users.find(1)).toEqual({
      id: "1",
      name: "Link",
      location: "Hyrule",
      evil: false,
    });

    user.save();

    expect(user.attrs).toEqual({
      id: "1",
      name: "Young link",
      location: "Hyrule",
      evil: false,
    });
    expect(server.db.users.find(1)).toEqual({
      id: "1",
      name: "Young link",
      location: "Hyrule",
      evil: false,
    });
  });

  test("it can update and immediately persist a single attribute", () => {
    let link = server.schema.users.find(1);
    link.update("evil", true);

    expect(link.attrs).toEqual({
      id: "1",
      name: "Link",
      location: "Hyrule",
      evil: true,
    });
    expect(server.db.users.find(1)).toEqual({
      id: "1",
      name: "Link",
      location: "Hyrule",
      evil: true,
    });
  });

  test("it can update a hash of attrs immediately", () => {
    let link = server.schema.users.find(1);
    link.update({ name: "Evil link", evil: true });

    expect(link.attrs).toEqual({
      id: "1",
      name: "Evil link",
      location: "Hyrule",
      evil: true,
    });
    expect(server.db.users.find(1)).toEqual({
      id: "1",
      name: "Evil link",
      location: "Hyrule",
      evil: true,
    });
  });

  test("it can update a non-existing attribute", () => {
    let link = server.schema.users.find(1);
    link.update({
      name: "Evil link",
      evil: true,
      reallyEvil: "absolutely evil",
    });

    expect(link.attrs).toEqual({
      id: "1",
      name: "Evil link",
      location: "Hyrule",
      evil: true,
      reallyEvil: "absolutely evil",
    });
    expect(server.db.users.find(1)).toEqual({
      id: "1",
      name: "Evil link",
      location: "Hyrule",
      evil: true,
      reallyEvil: "absolutely evil",
    });
  });

  test("if users sets incorrectly an attribute without using update, it will still work", () => {
    let link = server.schema.users.find(1);
    link.reallyEvil = "absolutely evil";
    link.update({ reallyEvil: "a little flower", evil: true });
    expect(link.attrs).toEqual({
      id: "1",
      reallyEvil: "a little flower",
      evil: true,
      location: "Hyrule",
      name: "Link",
    });
    expect(server.db.users.find(1)).toEqual({
      id: "1",
      reallyEvil: "a little flower",
      evil: true,
      location: "Hyrule",
      name: "Link",
    });
  });
});
