import { Server, Model, ActiveModelSerializer } from "miragejs";
import { camelize } from "@lib/utils/inflector";

describe("Integration | Server | Customized normalize method", function () {
  let server;

  beforeEach(function () {
    server = new Server({
      environment: "test",
      models: {
        contact: Model,
      },
      serializers: {
        application: ActiveModelSerializer,
        contact: ActiveModelSerializer.extend({
          normalize(payload) {
            let attrs = payload.some.random[1].attrs;
            Object.keys(attrs).forEach(camelize);

            let jsonApiDoc = {
              data: {
                type: "contacts",
                attributes: attrs,
              },
            };
            return jsonApiDoc;
          },
        }),
      },
    });
    server.timing = 0;
    server.logging = false;
  });

  afterEach(function () {
    server.shutdown();
  });

  test("custom model-specific normalize functions are used", async () => {
    expect.assertions(3);

    server.post("/contacts");

    let res = await fetch("/contacts", {
      method: "POST",
      body: JSON.stringify({
        some: {
          random: [
            {
              format: true,
            },
            {
              attrs: {
                first_name: "Zelda",
              },
            },
          ],
        },
      }),
    });

    expect(res.status).toBe(201);
    expect(server.db.contacts).toHaveLength(1);
    expect(server.db.contacts[0].firstName).toBe("Zelda");
  });

  test("custom model-specific normalize functions are used with custom function handlers", async () => {
    server.put("/contacts/:id", function (schema, request) {
      let attrs = this.normalizedRequestAttrs();

      expect(attrs).toEqual({
        id: "1",
        firstName: "Zelda",
      });

      return {};
    });

    await fetch("/contacts/1", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        some: {
          random: [
            {
              format: true,
            },
            {
              attrs: {
                first_name: "Zelda",
              },
            },
          ],
        },
      }),
    });
  });
});
