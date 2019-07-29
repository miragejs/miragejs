
import { Model, ActiveModelSerializer } from "@miragejs/server";
import { camelize } from "@lib/utils/inflector";
import Server from "@lib/server";
import promiseAjax from "../../helpers/promise-ajax";

describe("Integration | Server | Customized normalize method", function() {
  beforeEach(function() {
    this.server = new Server({
      environment: "test",
      models: {
        contact: Model
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
                attributes: attrs
              }
            };
            return jsonApiDoc;
          }
        })
      }
    });
    this.server.timing = 0;
    this.server.logging = false;
  });

  afterEach(function() {
    this.server.shutdown();
  });

  test("custom model-specific normalize functions are used", async () => {
    let { server } = this;
    expect.assertions(3);

    server.post("/contacts");

    let { xhr } = await promiseAjax({
      method: "POST",
      url: "/contacts",
      data: JSON.stringify({
        some: {
          random: [
            {
              format: true
            },
            {
              attrs: {
                first_name: "Zelda"
              }
            }
          ]
        }
      })
    });

    expect(xhr.status).toEqual(201);
    expect(server.db.contacts.length).toEqual(1);
    expect(server.db.contacts[0].firstName).toEqual("Zelda");
  });

  test("custom model-specific normalize functions are used with custom function handlers", async () => {
    let { server } = this;

    server.put("/contacts/:id", function(schema, request) {
      let attrs = this.normalizedRequestAttrs();

      expect(attrs).toEqual({
        id: "1",
        firstName: "Zelda"
      });

      return {};
    });

    await promiseAjax({
      method: "PUT",
      url: "/contacts/1",
      contentType: "application/json",
      data: JSON.stringify({
        some: {
          random: [
            {
              format: true
            },
            {
              attrs: {
                first_name: "Zelda"
              }
            }
          ]
        }
      })
    });
  });
});
