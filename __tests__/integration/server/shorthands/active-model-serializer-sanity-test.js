
import { Model, ActiveModelSerializer } from "@miragejs/server";
import Server from "@lib/server";
import promiseAjax from "../../../helpers/promise-ajax";

describe(
  "Integration | Server | Shorthands | Active Model Serializer Sanity check",
  function() {
    beforeEach(function() {
      this.server = new Server({
        environment: "test",
        models: {
          contact: Model
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

    test("a get shorthand works", async () => {
      expect.assertions(2);

      this.server.db.loadData({
        contacts: [{ id: 1, name: "Link" }]
      });

      this.server.get("/contacts");

      let { xhr, data } = await promiseAjax({
        method: "GET",
        url: "/contacts"
      });

      expect(xhr.status).toEqual(200);
      expect(data).toEqual({ contacts: [{ id: "1", name: "Link" }] });
    });

    test("a post shorthand works", async () => {
      let { server } = this;
      expect.assertions(2);

      server.post("/contacts");

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

    test("a put shorthand works", async () => {
      let { server } = this;
      expect.assertions(2);

      this.server.db.loadData({
        contacts: [{ id: 1, name: "Link" }]
      });

      server.put("/contacts/:id");

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

    test("a patch shorthand works", async () => {
      let { server } = this;
      expect.assertions(2);

      this.server.db.loadData({
        contacts: [{ id: 1, name: "Link" }]
      });

      server.patch("/contacts/:id");

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

    test("a delete shorthand works", async () => {
      let { server } = this;
      expect.assertions(3);

      this.server.db.loadData({
        contacts: [{ id: 1, name: "Link" }]
      });

      server.del("/contacts/:id");

      let { xhr } = await promiseAjax({
        method: "DELETE",
        url: "/contacts/1"
      });

      expect(xhr.responseText).toEqual("");
      expect(xhr.status).toEqual(204);
      expect(server.db.contacts.length).toEqual(0);
    });
  }
);
