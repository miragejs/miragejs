
import { Model, ActiveModelSerializer } from "@miragejs/server";
import Server from "@lib/server";
import promiseAjax from "../../helpers/promise-ajax";

describe("Integration | Server | Resource shorthand", function() {
  beforeEach(function() {
    this.server = new Server({
      environment: "test",
      models: {
        contact: Model,
        blogPost: Model
      },
      serializers: {
        application: ActiveModelSerializer
      }
    });
    this.server.timing = 0;
    this.server.logging = false;
  });

  afterEach(function() {
    this.server.shutdown();
  });

  test("resource generates get shorthand for index action", async () => {
    expect.assertions(2);

    this.server.db.loadData({
      contacts: [{ id: 1, name: "Link" }, { id: 2, name: "Zelda" }],
      blogPosts: [{ id: 1, title: "Post 1" }, { id: 2, title: "Post 2" }]
    });

    this.server.resource("contacts");

    let { data, xhr } = await promiseAjax({
      method: "GET",
      url: "/contacts"
    });

    expect(xhr.status).toEqual(200);
    expect(data).toEqual({
      contacts: [{ id: "1", name: "Link" }, { id: "2", name: "Zelda" }]
    });
  });

  test("resource generates get shorthand for show action", async () => {
    expect.assertions(2);

    this.server.db.loadData({
      contacts: [{ id: 1, name: "Link" }, { id: 2, name: "Zelda" }],
      blogPosts: [{ id: 1, title: "Post 1" }, { id: 2, title: "Post 2" }]
    });

    this.server.resource("contacts");
    this.server.resource("blog-posts", { path: "/posts" });

    let { data, xhr } = await promiseAjax({
      method: "GET",
      url: "/contacts/2"
    });

    expect(xhr.status).toEqual(200);
    expect(data).toEqual({ contact: { id: "2", name: "Zelda" } });
  });

  test("resource generates post shorthand", async () => {
    let { server } = this;
    expect.assertions(2);

    server.resource("contacts");

    let { xhr } = await promiseAjax({
      method: "POST",
      url: "/contacts",
      data: JSON.stringify({
        contact: {
          name: "Zelda"
        }
      })
    });

    expect(xhr.status).toEqual(201);
    expect(server.db.contacts.length).toEqual(1);
  });

  test("resource generates put shorthand", async () => {
    let { server } = this;
    expect.assertions(2);

    this.server.db.loadData({
      contacts: [{ id: 1, name: "Link" }],
      blogPosts: [{ id: 1, title: "Post 1" }]
    });

    server.resource("contacts");

    let { xhr } = await promiseAjax({
      method: "PUT",
      url: "/contacts/1",
      data: JSON.stringify({
        contact: {
          name: "Zelda"
        }
      })
    });

    expect(xhr.status).toEqual(200);
    expect(server.db.contacts[0].name).toEqual("Zelda");
  });

  test("resource generates patch shorthand", async () => {
    let { server } = this;
    expect.assertions(2);

    this.server.db.loadData({
      contacts: [{ id: 1, name: "Link" }],
      blogPosts: [{ id: 1, title: "Post 1" }]
    });

    server.resource("contacts");

    let { xhr } = await promiseAjax({
      method: "PATCH",
      url: "/contacts/1",
      data: JSON.stringify({
        contact: {
          name: "Zelda"
        }
      })
    });

    expect(xhr.status).toEqual(200);
    expect(server.db.contacts[0].name).toEqual("Zelda");
  });

  test("resource generates delete shorthand works", async () => {
    let { server } = this;
    expect.assertions(2);

    this.server.db.loadData({
      contacts: [{ id: 1, name: "Link" }],
      blogPosts: [{ id: 1, title: "Post 1" }]
    });

    server.resource("contacts");

    let { xhr } = await promiseAjax({
      method: "DELETE",
      url: "/contacts/1"
    });

    expect(xhr.status).toEqual(204);
    expect(server.db.contacts.length).toEqual(0);
  });

  test("resource accepts a custom path for a resource", async () => {
    expect.assertions(6);

    this.server.db.loadData({
      blogPosts: [{ id: 1, title: "Post 1" }, { id: 2, title: "Post 2" }]
    });

    this.server.resource("blog-posts", { path: "/posts" });

    let indexResponse = await promiseAjax({
      method: "GET",
      url: "/posts"
    });
    expect(indexResponse.xhr.status).toEqual(200);

    let showResponse = await promiseAjax({
      method: "GET",
      url: "/posts/2"
    });
    expect(showResponse.xhr.status).toEqual(200);

    let createResponse = await promiseAjax({
      method: "POST",
      url: "/posts",
      data: JSON.stringify({
        blog_post: {
          name: "Post 1"
        }
      })
    });
    expect(createResponse.xhr.status).toEqual(201);

    let updatePutResponse = await promiseAjax({
      method: "PUT",
      url: "/posts/1",
      data: JSON.stringify({
        blog_post: {
          name: "Post 2"
        }
      })
    });
    expect(updatePutResponse.xhr.status).toEqual(200);

    let updatePatchResponse = await promiseAjax({
      method: "PATCH",
      url: "/posts/1",
      data: JSON.stringify({
        blog_post: {
          name: "Post 2"
        }
      })
    });
    expect(updatePatchResponse.xhr.status).toEqual(200);

    let deleteResponse = await promiseAjax({
      method: "DELETE",
      url: "/posts/1"
    });
    expect(deleteResponse.xhr.status).toEqual(204);
  });

  test("resource accepts singular name", async () => {
    expect.assertions(4);

    this.server.db.loadData({
      contacts: [{ id: 1, name: "Link" }, { id: 2, name: "Zelda" }],
      blogPosts: [{ id: 1, title: "Post 1" }, { id: 2, title: "Post 2" }]
    });

    this.server.resource("contact");
    this.server.resource("blog-post", { path: "/posts" });

    let contactsResponse = await promiseAjax({
      method: "GET",
      url: "/contacts"
    });

    expect(contactsResponse.xhr.status).toEqual(200);
    expect(contactsResponse.data).toEqual({
      contacts: [{ id: "1", name: "Link" }, { id: "2", name: "Zelda" }]
    });

    let postsResponse = await promiseAjax({
      method: "GET",
      url: "/posts"
    });

    expect(postsResponse.xhr.status).toEqual(200);
    expect(postsResponse.data).toEqual({
      blog_posts: [{ id: "1", title: "Post 1" }, { id: "2", title: "Post 2" }]
    });
  });

  test("resource does not accept both :all and :except options", () => {
    let { server } = this;

    expect(() => {
      server.resource("contacts", { only: ["index"], except: ["create"] });
    }).toThrow();
  });

  test("resource generates shorthands which are whitelisted by :only option", async () => {
    let { server } = this;
    expect.assertions(1);

    server.db.loadData({
      contacts: [{ id: 1, name: "Link" }, { id: 2, name: "Zelda" }]
    });

    server.resource("contacts", { only: ["index"] });

    let { xhr } = await promiseAjax({
      method: "GET",
      url: "/contacts"
    });

    expect(xhr.status).toEqual(200);
  });

  test("resource does not generate shorthands which are not whitelisted with :only option", async () => {
    let { server } = this;
    expect.assertions(5);

    server.db.loadData({
      contacts: [{ id: 1, name: "Link" }]
    });

    server.resource("contacts", { only: ["index"] });

    try {
      await promiseAjax({
        method: "GET",
        url: "/contacts/1"
      });
    } catch (e) {
      expect(e.error.message.indexOf(
        "Mirage: Your Ember app tried to GET '/contacts/1'"
      ) > -1).toBeTruthy();
    }

    try {
      await promiseAjax({
        method: "POST",
        url: "/contacts",
        data: JSON.stringify({
          contact: {
            name: "Zelda"
          }
        })
      });
    } catch (e) {
      expect(e.error.message.indexOf(
        "Mirage: Your Ember app tried to POST '/contacts'"
      ) > -1).toBeTruthy();
    }

    try {
      await promiseAjax({
        method: "PUT",
        url: "/contacts/1",
        data: JSON.stringify({
          contact: {
            name: "Zelda"
          }
        })
      });
    } catch (e) {
      expect(e.error.message.indexOf(
        "Mirage: Your Ember app tried to PUT '/contacts/1'"
      ) > -1).toBeTruthy();
    }

    try {
      await promiseAjax({
        method: "PATCH",
        url: "/contacts/1",
        data: JSON.stringify({
          contact: {
            name: "Zelda"
          }
        })
      });
    } catch (e) {
      expect(e.error.message.indexOf(
        "Mirage: Your Ember app tried to PATCH '/contacts/1'"
      ) > -1).toBeTruthy();
    }

    try {
      await promiseAjax({
        method: "DELETE",
        url: "/contacts/1"
      });
    } catch (e) {
      expect(e.error.message.indexOf(
        "Mirage: Your Ember app tried to DELETE '/contacts/1'"
      ) > -1).toBeTruthy();
    }
  });

  test("resource generates shorthands which are not blacklisted by :except option", async () => {
    let { server } = this;
    expect.assertions(2);

    server.db.loadData({
      contacts: [{ id: 1, name: "Link" }]
    });

    server.resource("contacts", { except: ["create", "update", "delete"] });

    let indexResponse = await promiseAjax({
      method: "GET",
      url: "/contacts"
    });
    expect(indexResponse.xhr.status).toEqual(200);

    let showResponse = await promiseAjax({
      method: "GET",
      url: "/contacts/1"
    });
    expect(showResponse.xhr.status).toEqual(200);
  });

  test("resource does not generate shorthands which are blacklisted by :except option", async () => {
    let { server } = this;
    expect.assertions(4);

    server.db.loadData({
      contacts: [{ id: 1, name: "Link" }]
    });

    server.resource("contacts", { except: ["create", "update", "delete"] });

    try {
      await promiseAjax({
        method: "POST",
        url: "/contacts",
        data: JSON.stringify({
          contact: {
            name: "Zelda"
          }
        })
      });
    } catch (e) {
      expect(e.error.message.indexOf(
        "Mirage: Your Ember app tried to POST '/contacts'"
      ) > -1).toBeTruthy();
    }

    try {
      await promiseAjax({
        method: "PUT",
        url: "/contacts/1",
        data: JSON.stringify({
          contact: {
            name: "Zelda"
          }
        })
      });
    } catch (e) {
      expect(e.error.message.indexOf(
        "Mirage: Your Ember app tried to PUT '/contacts/1'"
      ) > -1).toBeTruthy();
    }

    try {
      await promiseAjax({
        method: "PATCH",
        url: "/contacts/1",
        data: JSON.stringify({
          contact: {
            name: "Zelda"
          }
        })
      });
    } catch (e) {
      expect(e.error.message.indexOf(
        "Mirage: Your Ember app tried to PATCH '/contacts/1'"
      ) > -1).toBeTruthy();
    }

    try {
      await promiseAjax({
        method: "DELETE",
        url: "/contacts/1"
      });
    } catch (e) {
      expect(e.error.message.indexOf(
        "Mirage: Your Ember app tried to DELETE '/contacts/1'"
      ) > -1).toBeTruthy();
    }
  });
});
