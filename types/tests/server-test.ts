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
  this.del("/foo");

  this.passthrough("/_coverage/upload");
  this.loadFixtures();

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
