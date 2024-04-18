import { Server, Model, JSONAPISerializer, Response } from "miragejs";

describe("Integration | Server | Regressions | 885 Serializer stale request bug test", function () {
  let server;

  beforeEach(function () {
    server = new Server({
      environment: "test",
      models: {
        eel: Model.extend(),
      },
      serializers: {
        clawlessEel: JSONAPISerializer,
      },
      routes() {
        this.get("/tigers/:id", new Response());
        this.get("/eels/:id", function (schema, request) {
          let eel = schema.eels.find(request.params.id);
          return this.serialize(eel, "clawlessEel");
        });
      },
    });
  });

  afterEach(function () {
    server.shutdown();
  });

  test("it works", async () => {
    let eel = server.create("eel");

    expect.assertions(1);

    // Make sure there is a request with an `include` query param that refers to a relationship that
    // doesn't exist on the `eel` resource, so that `JSONAPISerializer` would throw if the request
    // inside Mirage ends up staying the same when fetching `/eels/:id`.
    await fetch(`/tigers/1?include=claws`);

    let res = await fetch(`/eels/${eel.id}`);

    expect(res.status).toEqual(200);
  });
});
