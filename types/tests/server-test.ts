import { Response, Server } from "miragejs";

export default function config(this: Server): void {
  this.namespace = "foo";
  this.urlPrefix = "/api";
  this.timing = 123;
  this.logging = true;

  this.get("/foo");
  this.put("/foo");
  this.post("/foo");
  this.patch("/foo");
  this.options("/foo");
  this.del("/foo");

  this.passthrough("/_coverage/upload");
  this.passthrough(request => request.queryParams.skipMirage);

  this.loadFixtures();
  this.seeds(this);
  this.routes();

  this.shutdown();

  this.get("/test/:segment", (schema, request) => {
    schema.db; // $ExpectType Db

    request.params; // $ExpectType Record<string, string>
    request.queryParams; // $ExpectType Record<string, string>
    request.requestBody; // $ExpectType string | File
    request.requestHeaders; // $ExpectType Record<string, string>
    request.url; // $ExpectType string

    return new Response(200, { "Content-Type": "application/json" }, "{}");
  });

  this.get("/test/:segment", schema => Promise.resolve(schema.create("foo")));
}

const server = new Server({
  routes() {
    this.namespace = "api";

    this.get("/todos", () => {
      return {
        todos: [{ id: "1", text: "Migrate to TypeScript", isDone: false }]
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
  }
});
