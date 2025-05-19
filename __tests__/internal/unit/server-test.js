import { createServer, Server, Model, Factory } from "@lib";

describe("Unit | Server", function () {
  test("it can be instantiated", () => {
    let server = new Server({ environment: "test" });

    expect(server).toBeTruthy();

    server.shutdown();
  });

  test("routes return pretender handler", () => {
    let server = new Server({ environment: "test" });

    let handler = server.post("foo");

    expect(handler.numberOfCalls).toBe(0);

    server.shutdown();
  });

  test("it runs the default scenario in non-test environments", () => {
    expect.assertions(1);

    let server = new Server({
      environment: "development",
      seeds() {
        expect(true).toBeTruthy();
      },
    });

    server.shutdown();
  });
});

describe("Unit | createServer", function () {
  test("it returns a server instance", async () => {
    let server = createServer();

    expect(server).toBeTruthy();

    server.shutdown();
  });

  test("routes return pretender handler", async () => {
    let server = createServer({ environment: "test" });

    let handler = server.post("foo");

    expect(handler.numberOfCalls).toBe(0);

    server.shutdown();
  });

  test("it runs the default scenario in non-test environments", async () => {
    expect.assertions(1);

    let server = createServer({
      environment: "development",
      seeds() {
        expect(true).toBeTruthy();
      },
    });

    server.shutdown();
  });

  test("forces timing to be 0 in test environment", async () => {
    let server = createServer({ environment: "test" });

    expect(server.timing).toBe(0);

    server.shutdown();
  });

  test("allows setting the timing to 0", async () => {
    let server = createServer({ timing: 0 });

    expect(server.timing).toBe(0);

    server.shutdown();
  });
});

describe("Unit | Server #loadConfig", function () {
  test("forces timing to 0 in test environment", () => {
    let server = new Server({ environment: "test" });

    server.loadConfig(function () {
      this.timing = 50;
    });

    expect(server.timing).toBe(0);

    server.shutdown();
  });

  test("doesn't modify user's timing config in other environments", () => {
    let server = new Server({ environment: "blah" });

    server.loadConfig(function () {
      this.timing = 50;
    });

    expect(server.timing).toBe(50);

    server.shutdown();
  });
});

describe("Unit | Server #db", function () {
  test("its db is isolated across instances", () => {
    let server1 = new Server({ environment: "test" });

    server1.db.createCollection("contacts");
    server1.db.contacts.insert({ name: "Sam" });

    server1.shutdown();

    let server2 = new Server({ environment: "test" });

    expect(server2.contacts).toBeUndefined();

    server2.shutdown();
  });
});

describe("Unit | Server #create", function () {
  test("create fails when no factories or models are registered", () => {
    let server = new Server({ environment: "test" });

    expect(function () {
      server.create("contact");
    }).toThrow(
      "Mirage: You called create('contact') but no model or factory was found. Make sure you're passing in the singularized version of the model or factory name."
    );

    server.shutdown();
  });

  test("create fails when an expected factory isn't registered", () => {
    let server = new Server({
      environment: "test",
      factories: {
        address: Factory,
      },
    });

    expect(function () {
      server.create("contact");
    }).toThrow(
      "Mirage: You called create('contact') but no model or factory was found. Make sure you're passing in the singularized version of the model or factory name."
    );

    server.shutdown();
  });

  test("create works when models but no factories are registered", () => {
    let server = new Server({
      environment: "test",
      models: {
        contact: Model,
      },
    });

    server.create("contact");

    expect(server.db.contacts).toHaveLength(1);

    server.shutdown();
  });

  test("create adds the data to the db", () => {
    let server = new Server({
      environment: "test",
      factories: {
        contact: Factory.extend({
          name: "Sam",
        }),
      },
    });

    server.create("contact");
    let contactsInDb = server.db.contacts;

    expect(contactsInDb).toHaveLength(1);
    expect(contactsInDb[0]).toEqual({ id: "1", name: "Sam" });

    server.shutdown();
  });

  test("create returns the new data in the db", () => {
    let server = new Server({
      environment: "test",
      factories: {
        contact: Factory.extend({
          name: "Sam",
        }),
      },
    });

    let contact = server.create("contact");

    expect(contact).toEqual({ id: "1", name: "Sam" });

    server.shutdown();
  });
});

describe("Unit | Server #createList", function () {
  let server = null;

  beforeEach(function () {
    server = new Server({ environment: "test" });
  });

  afterEach(function () {
    server.shutdown();
  });

  test("createList adds the given number of elements to the db", () => {
    server.loadFactories({
      contact: Factory.extend({ name: "Sam" }),
    });

    server.createList("contact", 3);
    let contactsInDb = server.db.contacts;

    expect(contactsInDb).toHaveLength(3);
    expect(contactsInDb[0]).toEqual({ id: "1", name: "Sam" });
    expect(contactsInDb[1]).toEqual({ id: "2", name: "Sam" });
    expect(contactsInDb[2]).toEqual({ id: "3", name: "Sam" });
  });

  test("createList returns the created elements", () => {
    server.loadFactories({
      contact: Factory.extend({ name: "Sam" }),
    });

    server.create("contact");
    let contacts = server.createList("contact", 3);

    expect(contacts).toHaveLength(3);
    expect(contacts[0]).toEqual({ id: "2", name: "Sam" });
    expect(contacts[1]).toEqual({ id: "3", name: "Sam" });
    expect(contacts[2]).toEqual({ id: "4", name: "Sam" });
  });
});
