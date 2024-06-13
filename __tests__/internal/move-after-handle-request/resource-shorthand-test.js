import { Server, Model, ActiveModelSerializer } from "miragejs";

describe("Integration | Server | Resource shorthand", function () {
  let server;

  beforeEach(function () {
    server = new Server({
      environment: "test",
      models: {
        contact: Model,
        blogPost: Model,
      },
      serializers: {
        application: ActiveModelSerializer,
      },
    });
    server.timing = 0;
    server.logging = false;
  });

  afterEach(function () {
    server.shutdown();
  });

  test("resource generates get shorthand for index action", async () => {
    expect.assertions(2);

    server.db.loadData({
      contacts: [
        { id: 1, name: "Link" },
        { id: 2, name: "Zelda" },
      ],
      blogPosts: [
        { id: 1, title: "Post 1" },
        { id: 2, title: "Post 2" },
      ],
    });

    server.resource("contacts");

    let res = await fetch("/contacts");
    let data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({
      contacts: [
        { id: "1", name: "Link" },
        { id: "2", name: "Zelda" },
      ],
    });
  });

  test("resource generates get shorthand for show action", async () => {
    expect.assertions(2);

    server.db.loadData({
      contacts: [
        { id: 1, name: "Link" },
        { id: 2, name: "Zelda" },
      ],
      blogPosts: [
        { id: 1, title: "Post 1" },
        { id: 2, title: "Post 2" },
      ],
    });

    server.resource("contacts");
    server.resource("blog-posts", { path: "/posts" });

    let res = await fetch("/contacts/2");
    let data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ contact: { id: "2", name: "Zelda" } });
  });

  test("resource generates post shorthand", async () => {
    expect.assertions(2);

    server.resource("contacts");

    let res = await fetch("/contacts", {
      method: "POST",
      body: JSON.stringify({
        contact: {
          name: "Zelda",
        },
      }),
    });

    expect(res.status).toBe(201);
    expect(server.db.contacts).toHaveLength(1);
  });

  test("resource generates put shorthand", async () => {
    expect.assertions(2);

    server.db.loadData({
      contacts: [{ id: 1, name: "Link" }],
      blogPosts: [{ id: 1, title: "Post 1" }],
    });

    server.resource("contacts");

    let res = await fetch("/contacts/1", {
      method: "PUT",
      body: JSON.stringify({
        contact: {
          name: "Zelda",
        },
      }),
    });

    expect(res.status).toBe(200);
    expect(server.db.contacts[0].name).toBe("Zelda");
  });

  test("resource generates patch shorthand", async () => {
    expect.assertions(2);

    server.db.loadData({
      contacts: [{ id: 1, name: "Link" }],
      blogPosts: [{ id: 1, title: "Post 1" }],
    });

    server.resource("contacts");

    let res = await fetch("/contacts/1", {
      method: "PATCH",
      body: JSON.stringify({
        contact: {
          name: "Zelda",
        },
      }),
    });

    expect(res.status).toBe(200);
    expect(server.db.contacts[0].name).toBe("Zelda");
  });

  test("resource generates delete shorthand works", async () => {
    expect.assertions(2);

    server.db.loadData({
      contacts: [{ id: 1, name: "Link" }],
      blogPosts: [{ id: 1, title: "Post 1" }],
    });

    server.resource("contacts");

    let res = await fetch("/contacts/1", { method: "DELETE" });

    expect(res.status).toBe(204);
    expect(server.db.contacts).toHaveLength(0);
  });

  test("resource accepts a custom path for a resource", async () => {
    expect.assertions(6);

    server.db.loadData({
      blogPosts: [
        { id: 1, title: "Post 1" },
        { id: 2, title: "Post 2" },
      ],
    });

    server.resource("blog-posts", { path: "/posts" });

    let indexResponse = await fetch("/posts");
    expect(indexResponse.status).toBe(200);

    let showResponse = await fetch("/posts/2");
    expect(showResponse.status).toBe(200);

    let createResponse = await fetch("/posts", {
      method: "POST",
      body: JSON.stringify({
        blog_post: {
          name: "Post 1",
        },
      }),
    });
    expect(createResponse.status).toBe(201);

    let updatePutResponse = await fetch("/posts/1", {
      method: "PUT",
      body: JSON.stringify({
        blog_post: {
          name: "Post 2",
        },
      }),
    });
    expect(updatePutResponse.status).toBe(200);

    let updatePatchResponse = await fetch("/posts/1", {
      method: "PATCH",
      body: JSON.stringify({
        blog_post: {
          name: "Post 2",
        },
      }),
    });
    expect(updatePatchResponse.status).toBe(200);

    let deleteResponse = await fetch("/posts/1", { method: "DELETE" });
    expect(deleteResponse.status).toBe(204);
  });

  test("resource accepts singular name", async () => {
    expect.assertions(4);

    server.db.loadData({
      contacts: [
        { id: 1, name: "Link" },
        { id: 2, name: "Zelda" },
      ],
      blogPosts: [
        { id: 1, title: "Post 1" },
        { id: 2, title: "Post 2" },
      ],
    });

    server.resource("contact");
    server.resource("blog-post", { path: "/posts" });

    let contactsResponse = await fetch("/contacts");
    let contactsResponseData = await contactsResponse.json();

    expect(contactsResponse.status).toBe(200);
    expect(contactsResponseData).toEqual({
      contacts: [
        { id: "1", name: "Link" },
        { id: "2", name: "Zelda" },
      ],
    });

    let postsResponse = await fetch("/posts");
    let postsResponseData = await postsResponse.json();

    expect(postsResponse.status).toBe(200);
    expect(postsResponseData).toEqual({
      blog_posts: [
        { id: "1", title: "Post 1" },
        { id: "2", title: "Post 2" },
      ],
    });
  });

  test("resource does not accept both :all and :except options", () => {
    expect(() => {
      server.resource("contacts", { only: ["index"], except: ["create"] });
    }).toThrow("cannot use both :only and :except options");
  });

  test("resource generates shorthands which are whitelisted by :only option", async () => {
    expect.assertions(1);

    server.db.loadData({
      contacts: [
        { id: 1, name: "Link" },
        { id: 2, name: "Zelda" },
      ],
    });

    server.resource("contacts", { only: ["index"] });

    let res = await fetch("/contacts");

    expect(res.status).toBe(200);
  });

  test("resource does not generate shorthands which are not whitelisted with :only option", async () => {
    expect.assertions(5);

    server.db.loadData({
      contacts: [{ id: 1, name: "Link" }],
    });

    server.resource("contacts", { only: ["index"] });

    await expect(fetch("/contacts/1")).rejects.toThrow(
      "Mirage: Your app tried to GET '/contacts/1'"
    );
    await expect(fetch("/contacts", { method: "POST" })).rejects.toThrow(
      "Mirage: Your app tried to POST '/contacts'"
    );
    await expect(fetch("/contacts/1", { method: "PUT" })).rejects.toThrow(
      "Mirage: Your app tried to PUT '/contacts/1'"
    );
    await expect(fetch("/contacts/1", { method: "PATCH" })).rejects.toThrow(
      "Mirage: Your app tried to PATCH '/contacts/1'"
    );
    await expect(fetch("/contacts/1", { method: "DELETE" })).rejects.toThrow(
      "Mirage: Your app tried to DELETE '/contacts/1'"
    );
  });

  test("resource generates shorthands which are not blacklisted by :except option", async () => {
    expect.assertions(2);

    server.db.loadData({
      contacts: [{ id: 1, name: "Link" }],
    });

    server.resource("contacts", { except: ["create", "update", "delete"] });

    let indexResponse = await fetch("/contacts");
    expect(indexResponse.status).toBe(200);

    let showResponse = await fetch("/contacts/1");
    expect(showResponse.status).toBe(200);
  });

  test("resource does not generate shorthands which are blacklisted by :except option", async () => {
    expect.assertions(4);

    server.db.loadData({
      contacts: [{ id: 1, name: "Link" }],
    });

    server.resource("contacts", { except: ["create", "update", "delete"] });

    await expect(fetch("/contacts", { method: "POST" })).rejects.toThrow(
      "Mirage: Your app tried to POST '/contacts'"
    );
    await expect(fetch("/contacts/1", { method: "PUT" })).rejects.toThrow(
      "Mirage: Your app tried to PUT '/contacts/1'"
    );
    await expect(fetch("/contacts/1", { method: "PATCH" })).rejects.toThrow(
      "Mirage: Your app tried to PATCH '/contacts/1'"
    );
    await expect(fetch("/contacts/1", { method: "DELETE" })).rejects.toThrow(
      "Mirage: Your app tried to DELETE '/contacts/1'"
    );
  });
});
