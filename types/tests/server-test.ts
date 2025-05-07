import { expectType, expectError } from "tsd";

import {
  Response,
  Server,
  JSONAPISerializer,
  createServer,
  Model,
  belongsTo,
  hasMany,
  Factory,
} from "miragejs";
import Db from "miragejs/db";

export default function config(this: Server): void {
  this.namespace = "foo";
  this.urlPrefix = "/api";
  this.timing = 123;
  this.logging = true;

  expectType<void>(this.get("/foo"));
  expectType<void>(this.put("/foo"));
  expectType<void>(this.post("/foo"));
  expectType<void>(this.patch("/foo"));
  expectType<void>(this.options("/foo"));
  expectType<void>(this.del("/foo"));

  this.get("/foo", () => ({}));
  this.get("/foo", () => 0);
  this.get("/foo", () => "foo");
  this.get("/foo", () => true);
  this.get("/foo", () => null);
  this.get("/foo", () => ["foo"]);
  this.get("/foo", () => ["foo", 0]);
  this.get<number>("/foo", () => 0);
  this.get<[number, string]>("/foo", () => [0, "foo"]);

  expectError(this.get<number>("/foo", () => false));
  expectError(this.get<[number, string]>("/foo", () => ["foo", 0]));

  expectType<void>(this.resource("foo"));

  expectType<void>(this.passthrough("/_coverage/upload"));
  expectType<void>(
    this.passthrough("/_coverage/upload_a", "/_coverage/upload_b")
  );
  expectError(this.passthrough(["/_coverage/upload"]));
  expectType<void>(
    this.passthrough((request) => request.queryParams.skipMirage)
  );
  expectType<void>(this.passthrough("/_coverage/upload", ["get"]));
  // prettier-ignore
  expectType<void>(this.passthrough("/_coverage/upload", (request) => request.queryParams.skipMirage));
  // prettier-ignore
  expectType<void>(this.passthrough("/_coverage/upload", (request) => request.queryParams.skipMirage, ["post"]));

  expectType<void>(this.loadFixtures());
  expectType<void>(this.seeds(this));
  expectType<void>(this.routes());

  expectType<void>(this.shutdown());

  this.get("/test/:segment", (schema, request) => {
    expectType<Db>(schema.db);

    expectType<Record<string, string>>(request.params);
    expectType<Record<string, string | string[] | null | undefined>>(
      request.queryParams
    );
    expectType<string>(request.requestBody);
    expectType<Record<string, string>>(request.requestHeaders);
    expectType<string>(request.url);

    return new Response(200, { "Content-Type": "application/json" }, "{}");
  });

  expectType<void>(
    this.get("/test/:segment", (schema) =>
      Promise.resolve(schema.create("foo"))
    )
  );
}

// In `new Server`, models and factories are untyped, and you can
// therefore use any model names you want when interacting with the
// schema; the return values just won't necessarily have a lot of
// type information.
new Server({
  serializers: {
    application: JSONAPISerializer,
  },
  fixtures: {
    countries: [
      { id: 1, name: "China" },
      { id: 2, name: "India" },
      { id: 3, name: "United States" },
    ],
  },
  routes() {
    this.namespace = "api";

    this.schema.all("asfd");

    this.get("/todos", () => {
      return {
        todos: [{ id: "1", text: "Migrate to TypeScript", isDone: false }],
      };
    });
  },

  baseConfig() {
    this.pretender.handledRequest = (verb, path, request) => {};
    this.get("/contacts", () => {
      return ["Interstellar", "Inception", "Dunkirk"];
    });
  },

  testConfig() {
    this.namespace = "/test-api";
    this.get("/movies");
    this.post("/movies");
  },
});

// In contrast to `new Server`, `createServer` is able to infer
// type info from the models and factories you pass it
createServer({
  models: {
    pet: Model.extend({
      owner: belongsTo("person"),
    }),
    person: Model.extend({
      children: hasMany("person"),
      friends: hasMany<"person" | "pet">({ polymorphic: true }),
    }),
  },

  factories: {
    pet: Factory.extend({
      name: (n: number) => `Pet ${n}`,
    }),
    person: Factory.extend({
      name: (n: number) => `Pet ${n}`,
    }),
  },

  routes() {
    this.get("people/:id", (schema, request) => {
      let person = this.schema.find("person", request.params.id);

      expectType<string | undefined>(person?.name);

      let friend = person?.friends.models[0];

      expectType<string | undefined>(friend?.name);
      expectError(friend?.children);

      if (friend && "friends" in friend) {
        expectType<string>(friend.children.modelName);
      }

      return person ?? new Response(404);
    });

    expectError(
      this.get("bad", () => {
        return this.schema.all("typo");
      })
    );
  },
});
