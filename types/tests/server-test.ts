import { Response, Server } from "miragejs";

export default function config(this: Server): void {
  this.namespace = "foo";
  this.urlPrefix = "/api";
  this.timing = 123;
  this.logging = true;

  this.get("/foo"); // $ExpectType void
  this.put("/foo"); // $ExpectType void
  this.post("/foo"); // $ExpectType void
  this.patch("/foo"); // $ExpectType void
  this.options("/foo"); // $ExpectType void
  this.del("/foo"); // $ExpectType void

  this.passthrough("/_coverage/upload"); // $ExpectType void
  this.passthrough((request) => request.queryParams.skipMirage); // $ExpectType void

  this.loadFixtures(); // $ExpectType void
  this.seeds(this); // $ExpectType void
  this.routes(); // $ExpectType void

  this.shutdown(); // $ExpectType void

  this.get("/test/:segment", (schema, request) => {
    schema.db; // $ExpectType Db

    request.params; // $ExpectType Record<string, string>
    request.queryParams; // $ExpectType Record<string, string>
    request.requestBody; // $ExpectType string
    request.requestHeaders; // $ExpectType Record<string, string>
    request.url; // $ExpectType string

    return new Response(200, { "Content-Type": "application/json" }, "{}");
  });

  this.get("/test/:segment", (schema) => Promise.resolve(schema.create("foo"))); // $ExpectType void
}

const server = new Server({
  fixtures: {
    countries: [
      { id: 1, name: "China" },
      { id: 2, name: "India" },
      { id: 3, name: "United States" },
    ],
  },
  routes() {
    this.namespace = "api";

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
